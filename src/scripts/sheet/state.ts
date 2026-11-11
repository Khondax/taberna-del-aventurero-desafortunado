// Estado de la ficha en el navegador y su ciclo de vida: cada cambio pasa por `update`, que
// guarda una copia para deshacer, normaliza, vuelve a pintar y programa el guardado.
import { actions, getActionPath } from 'astro:actions';
import { currentSchemaVersion } from '../../lib/ids';
import { noDeathSaves, type Character, type Pool, type SheetFile } from '../../lib/sheet';

export const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const root = $('#sheet');
export const slug = root.dataset.slug!;
const file = JSON.parse(root.dataset.sheet!) as SheetFile;
export const state: Character = file.character;
let version = file.version;

/** Archivo tal como se exporta: el mismo formato que en disco. */
export const currentFile = (): SheetFile => ({ schemaVersion: currentSchemaVersion, version, character: state });

// --- Render ------------------------------------------------------------------

const renderers: (() => void)[] = [];
/** Registra una función que se ejecuta tras cada cambio de estado. */
export const onRender = (renderer: () => void) => renderers.push(renderer);
export const render = () => renderers.forEach((renderer) => renderer());

// --- Rutas (`abilities.fue`, `spellSlots.3.max`) -------------------------------

export function getPath(target: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => (value as Record<string, unknown> | null)?.[key], target);
}
export function setPath(target: object, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;
  const parent = keys.reduce<Record<string, unknown>>((obj, key) => (obj[key] ??= {}) as Record<string, unknown>, target as Record<string, unknown>);
  parent[last] = value;
}

// --- Guardado ----------------------------------------------------------------

const saveState = $('#saveState');
let saveTimer: number | undefined;
let saveQueue = Promise.resolve();
let failed = false;
let blocked = false;

function setSaveState(text: string, kind: 'ok' | 'pending' | 'error') {
  saveState.textContent = text;
  saveState.dataset.state = kind;
}

async function save() {
  if (blocked) return;
  const { data, error } = await actions
    .saveCharacter({ slug, version, character: state })
    .catch(() => ({ data: undefined, error: { code: 'NETWORK', message: 'Sin conexión con el servidor.' } }));
  if (error) {
    failed = true;
    blocked = error.code === 'CONFLICT' || error.code === 'NOT_FOUND';
    setSaveState(blocked ? `${error.message} Recarga la página.` : `Error al guardar: ${error.message} Se reintentará con el próximo cambio.`, 'error');
    return;
  }
  version = data.version;
  failed = false;
  if (saveTimer === undefined) setSaveState('Guardado', 'ok');
}

/** Pinta y programa un guardado 500 ms después del último cambio. Los guardados van en serie. */
export function commit() {
  render();
  if (blocked) return;
  setSaveState('Guardando…', 'pending');
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveTimer = undefined;
    saveQueue = saveQueue.then(save);
  }, 500);
}

/** Al salir de la página, envía el guardado que estaba esperando su medio segundo. */
function flushOnExit() {
  if (saveTimer === undefined || blocked) return;
  clearTimeout(saveTimer);
  saveTimer = undefined;
  fetch(getActionPath(actions.saveCharacter), {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ slug, version, character: state }),
  });
}
window.addEventListener('pagehide', flushOnExit);
window.addEventListener('beforeunload', (event) => {
  flushOnExit();
  // Solo avisa si el último guardado falló y hay cambios que no llegaron al servidor.
  if (failed) event.preventDefault();
});

// --- Cambios y deshacer ----------------------------------------------------------

const undoStack: Character[] = [];
export const canUndo = () => undoStack.length > 0;

/**
 * Mantiene los contadores dentro de sus límites y quita los niveles de espacio a 0. Con PG,
 * las salvaciones contra la muerte vuelven a cero (cubre también editar los PG a mano).
 */
function normalize() {
  const clampPool = (pool: Pool) => {
    pool.max = Math.max(0, pool.max);
    pool.current = clamp(pool.current, 0, pool.max);
  };
  state.level = clamp(state.level, 1, 20);
  clampPool(state.hp);
  if (state.hp.current > 0) state.deathSaves = noDeathSaves();
  clampPool(state.hitDice);
  for (const [level, slots] of Object.entries(state.spellSlots)) {
    if (slots.max <= 0) delete state.spellSlots[level];
    else clampPool(slots);
  }
  for (const entry of [...state.features, ...state.inventory]) if (entry.uses) clampPool(entry.uses);
}

/** Aplica un cambio de estado que se puede deshacer. */
export function update(mutate: () => void) {
  undoStack.push(structuredClone(state));
  if (undoStack.length > 50) undoStack.shift();
  mutate();
  normalize();
  commit();
}

export function undo() {
  const previous = undoStack.pop();
  if (!previous) return;
  // Las notas no pasan por `update`: deshacer otro cambio no debe borrar lo escrito después.
  Object.assign(state, previous, { notes: state.notes });
  commit();
}

export const log = (title: string, detail: string) => state.history.push({ date: new Date().toISOString(), title, detail });
