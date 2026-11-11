// Edición de armas, conjuros, objetos y rasgos (diálogo con formulario generado a partir de
// `fields`) y alta desde los listados del SRD (`picker`).
import { describe, masteries } from '../../lib/describe';
import {
  abilities,
  abilityNames,
  defaultWeaponProficiency,
  formatNumber,
  normalize,
  spellLevelText,
  type Character,
  type Feature,
  type InventoryItem,
  type Spell,
  type Weapon,
} from '../../lib/sheet';
import { $, getPath, log, root, setPath, state, update } from './state';
import { registerTipSource, renderDescription } from './tooltip';

type Kind = 'weapons' | 'spells' | 'inventory' | 'features';
type Entry = Weapon | Spell | InventoryItem | Feature;

interface Field {
  path: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'list';
  options?: [string, string][];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

const usesFields: Field[] = [
  { path: 'uses.max', label: 'Usos máximos (0 = sin usos)', type: 'number', min: 0 },
  { path: 'uses.current', label: 'Usos disponibles', type: 'number', min: 0 },
  { path: 'uses.recovery', label: 'Se recuperan', type: 'select', options: [['largo', 'Descanso largo'], ['corto', 'Descanso corto'], ['ninguna', 'No se recuperan']] },
];
const saveOptions: [string, string][] = [['', 'Ninguna'], ...abilities.map((a): [string, string] => [a, abilityNames[a]])];

const kinds: Record<Kind, { singular: string; fields: Field[]; blank: () => Entry }> = {
  weapons: {
    singular: 'Arma',
    fields: [
      { path: 'name', label: 'Nombre', type: 'text', required: true },
      { path: 'category', label: 'Categoría', type: 'select', options: [['sencilla', 'Sencilla'], ['marcial', 'Marcial']] },
      { path: 'damage', label: 'Daño', type: 'text', required: true },
      { path: 'damageType', label: 'Tipo de daño', type: 'text' },
      { path: 'versatile', label: 'Daño a dos manos (versátil)', type: 'text' },
      { path: 'magicBonus', label: 'Bonificador mágico', type: 'number', min: -5, max: 5 },
      { path: 'mastery', label: 'Maestría', type: 'select', options: [['', 'Ninguna'], ...Object.keys(masteries).map((m): [string, string] => [m, m])] },
      { path: 'range', label: 'Alcance', type: 'text' },
      { path: 'weightKg', label: 'Peso (kg)', type: 'number', min: 0, step: 0.01 },
      { path: 'properties', label: 'Propiedades (separadas por comas)', type: 'list' },
      { path: 'ranged', label: 'A distancia (usa Destreza)', type: 'checkbox' },
      { path: 'proficient', label: 'Competente', type: 'checkbox' },
      { path: 'description', label: 'Descripción', type: 'textarea' },
    ],
    blank: (): Weapon => ({ name: '', category: 'sencilla', ranged: false, damage: '1d6', damageType: '', versatile: '', properties: [], range: '', mastery: '', proficient: true, magicBonus: 0, weightKg: 0, description: '' }),
  },
  spells: {
    singular: 'Conjuro',
    fields: [
      { path: 'name', label: 'Nombre', type: 'text', required: true },
      { path: 'level', label: 'Nivel', type: 'select', options: Array.from({ length: 10 }, (_, l): [string, string] => [String(l), spellLevelText(l)]) },
      { path: 'school', label: 'Escuela', type: 'text' },
      { path: 'casting', label: 'Lanzamiento', type: 'text' },
      { path: 'range', label: 'Alcance', type: 'text' },
      { path: 'components', label: 'Componentes', type: 'text' },
      { path: 'duration', label: 'Duración', type: 'text' },
      { path: 'save', label: 'Salvación del objetivo', type: 'select', options: saveOptions },
      { path: 'effect.dice', label: 'Dados de daño o curación', type: 'text' },
      { path: 'effect.type', label: 'Tipo (fuego, curación…)', type: 'text' },
      { path: 'concentration', label: 'Concentración', type: 'checkbox' },
      { path: 'ritual', label: 'Ritual', type: 'checkbox' },
      { path: 'attack', label: 'Requiere tirada de ataque', type: 'checkbox' },
      { path: 'effect.addModifier', label: 'Suma el modificador de aptitud mágica', type: 'checkbox' },
      { path: 'higherLevels', label: 'A niveles superiores', type: 'textarea' },
      { path: 'description', label: 'Descripción', type: 'textarea' },
    ],
    blank: (): Spell => ({ name: '', level: 1, school: '', casting: '1 acción', range: '', components: '', duration: 'Instantánea', concentration: false, ritual: false, description: '', effect: null, save: null, attack: false, higherLevels: '' }),
  },
  inventory: {
    singular: 'Objeto',
    fields: [
      { path: 'name', label: 'Nombre', type: 'text', required: true },
      { path: 'kind', label: 'Tipo', type: 'text' },
      { path: 'quantity', label: 'Cantidad', type: 'number', min: 0 },
      { path: 'weightKg', label: 'Peso por unidad (kg)', type: 'number', min: 0, step: 0.01 },
      { path: 'armor.kind', label: 'Armadura', type: 'select', options: [['', 'No es armadura'], ['ligera', 'Ligera (toda la Des)'], ['intermedia', 'Intermedia (Des hasta +2)'], ['pesada', 'Pesada (sin Des)'], ['escudo', 'Escudo']] },
      { path: 'armor.base', label: 'CA base (escudo: bonificador)', type: 'number', min: 0, max: 30 },
      { path: 'equipped', label: 'Equipado (cuenta para la CA si es armadura)', type: 'checkbox' },
      ...usesFields,
      { path: 'description', label: 'Descripción', type: 'textarea' },
    ],
    blank: (): InventoryItem => ({ name: '', kind: '', quantity: 1, weightKg: 0, description: '', uses: null, equipped: false, armor: null }),
  },
  features: {
    singular: 'Rasgo',
    fields: [
      { path: 'name', label: 'Nombre', type: 'text', required: true },
      { path: 'source', label: 'Origen (clase, especie, dote…)', type: 'text' },
      ...usesFields,
      { path: 'description', label: 'Descripción', type: 'textarea' },
    ],
    blank: (): Feature => ({ name: '', source: '', description: '', uses: null }),
  },
};

const listFor = (kind: Kind) => state[kind] as Entry[];

/** Inserta una entrada; los conjuros quedan ordenados por nivel y nombre. */
function insert(kind: Kind, entry: Entry) {
  const list = listFor(kind);
  list.push(entry);
  if (kind === 'spells') state.spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, 'es'));
}

// --- Diálogo de edición ------------------------------------------------------------

const editDialog = $<HTMLDialogElement>('#editDialog');
const editForm = $<HTMLFormElement>('#editForm');
const editFields = $('#editFields');
let editing: { kind: Kind; index: number | null; draft: Entry } | null = null;

function buildField(field: Field, value: unknown): HTMLElement {
  const label = document.createElement('label');
  label.className = field.type === 'textarea' ? 'span-all' : field.type === 'checkbox' ? 'check' : '';
  const caption = document.createElement('span');
  caption.textContent = field.label;
  let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  if (field.type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 3;
    input.value = String(value ?? '');
  } else if (field.type === 'select') {
    input = document.createElement('select');
    for (const [optionValue, optionLabel] of field.options ?? []) input.add(new Option(optionLabel, optionValue));
    input.value = String(value ?? field.options?.[0]?.[0] ?? '');
  } else {
    input = document.createElement('input');
    input.type = field.type === 'list' ? 'text' : field.type;
    if (field.type === 'checkbox') input.checked = Boolean(value);
    else input.value = field.type === 'list' ? (value as string[] | undefined)?.join(', ') ?? '' : String(value ?? '');
    if (field.min !== undefined) input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    input.step = String(field.step ?? 1);
  }
  input.name = field.path;
  input.required = Boolean(field.required);
  if (field.type !== 'checkbox') input.className = 'field';
  if (field.type === 'checkbox') label.append(input, caption);
  else label.append(caption, input);
  return label;
}

/** Lee el formulario sobre una copia del borrador y limpia los grupos opcionales vacíos. */
function readForm(kind: Kind, draft: Entry): Entry {
  const entry = structuredClone(draft) as Record<string, unknown>;
  for (const field of kinds[kind].fields) {
    const input = editForm.elements.namedItem(field.path) as HTMLInputElement;
    const value =
      field.type === 'checkbox' ? input.checked
      : field.type === 'number' ? Number(input.value) || 0
      : field.type === 'list' ? input.value.split(',').map((p) => p.trim()).filter(Boolean)
      : field.path === 'level' ? Number(input.value)
      : input.value.trim();
    setPath(entry, field.path, value);
  }
  if (entry.save === '') entry.save = null;
  const uses = entry.uses as { max: number; current: number } | null | undefined;
  if (uses && uses.max <= 0) entry.uses = null;
  else if (uses) uses.current = Math.min(uses.current, uses.max);
  const effect = entry.effect as { dice: string } | null | undefined;
  if (effect && !effect.dice) entry.effect = null;
  const armor = entry.armor as { kind: string } | null | undefined;
  if (armor && !armor.kind) entry.armor = null;
  return entry as unknown as Entry;
}

function openEditor(kind: Kind, index: number | null, draft: Entry) {
  editing = { kind, index, draft };
  $('#editKind').textContent = index === null ? `${kinds[kind].singular} nuevo` : kinds[kind].singular;
  $('#editTitle').textContent = draft.name || 'Sin nombre';
  // La descripción calculada (ataque, CD, daño…) se muestra aquí también para pantallas táctiles.
  const preview = { ...state, [kind]: [draft] } as Character;
  const description = describe(preview, `${kind}:0`);
  const summary = $('#editSummary');
  if (description && index !== null) renderDescription(summary, description, false);
  summary.hidden = !description || index === null;
  editFields.replaceChildren(...kinds[kind].fields.map((field) => buildField(field, getPath(draft, field.path))));
  $('#editDelete').hidden = index === null;
  editDialog.showModal();
}

editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!editing) return;
  const { kind, index } = editing;
  const entry = readForm(kind, editing.draft);
  update(() => {
    if (index === null) {
      insert(kind, entry);
      log(`${kinds[kind].singular} añadido`, entry.name);
    } else {
      listFor(kind)[index] = entry;
      if (kind === 'spells') state.spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, 'es'));
    }
  });
  editDialog.close();
});

function remove(kind: Kind, index: number) {
  update(() => {
    const [removed] = listFor(kind).splice(index, 1);
    log(`${kinds[kind].singular} quitado`, removed.name);
  });
}

$('#editDelete').addEventListener('click', () => {
  if (!editing || editing.index === null) return;
  remove(editing.kind, editing.index);
  editDialog.close();
});

// Botón «×» de cada fila: quita la entrada sin abrir el diálogo (se puede deshacer).
root.addEventListener('click', (event) => {
  const button = (event.target as Element).closest('[data-remove]');
  if (!button) return;
  const [kind, id] = button.closest<HTMLElement>('[data-entry]')!.dataset.entry!.split(':') as [Kind, string];
  remove(kind, Number(id));
});

root.addEventListener('click', (event) => {
  const edit = (event.target as Element).closest('[data-edit]');
  if (!edit) return;
  const [kind, id] = edit.closest<HTMLElement>('[data-entry]')!.dataset.entry!.split(':') as [Kind, string];
  openEditor(kind, Number(id), structuredClone(listFor(kind)[Number(id)]));
});

// --- Listados ------------------------------------------------------------------------

const picker = $<HTMLDialogElement>('#picker');
const pickerList = $('#pickerList');
const pickerSearch = $<HTMLInputElement>('#pickerSearch');
const pickerFilter = $<HTMLSelectElement>('#pickerFilter');
let pickerKind: Kind = 'spells';
let catalog: Entry[] = [];

const pickerTitles: Record<Kind, string> = { weapons: 'Añadir arma', spells: 'Añadir conjuro', inventory: 'Añadir objeto', features: 'Añadir rasgo o dote' };

/** Filtros por tipo: [valor, etiqueta, predicado]. */
const filters: Record<Kind, [string, string, (entry: Entry) => boolean][]> = {
  spells: [['', 'Todos los niveles', () => true], ...Array.from({ length: 10 }, (_, l): [string, string, (e: Entry) => boolean] => [String(l), spellLevelText(l), (e) => (e as Spell).level === l])],
  weapons: [['', 'Todas', () => true], ['sencilla', 'Sencillas', (e) => (e as Weapon).category === 'sencilla'], ['marcial', 'Marciales', (e) => (e as Weapon).category === 'marcial']],
  inventory: [['', 'Todo', () => true], ['armadura', 'Armaduras', (e) => /armadura|escudo/i.test((e as InventoryItem).kind)], ['otros', 'Equipo y consumibles', (e) => !/armadura|escudo/i.test((e as InventoryItem).kind)]],
  features: [
    ['', 'Todo', () => true],
    ['dotes', 'Dotes, estilos y reglas', (e) => /dote|estilo|regla/i.test((e as Feature).source)],
    ...['Bárbaro', 'Bardo', 'Brujo', 'Clérigo', 'Druida', 'Explorador', 'Guerrero', 'Hechicero', 'Mago', 'Monje', 'Paladín', 'Pícaro'].map(
      (name): [string, string, (e: Entry) => boolean] => [name, name, (e) => (e as Feature).source.startsWith(name)],
    ),
  ],
};

function catalogDetail(kind: Kind, entry: Entry): string {
  switch (kind) {
    case 'spells': { const s = entry as Spell; return `${spellLevelText(s.level)} · ${s.school} · ${s.casting}`; }
    case 'weapons': { const w = entry as Weapon; return [`${w.category === 'sencilla' ? 'Sencilla' : 'Marcial'}`, `${w.damage} ${w.damageType}`, ...w.properties].join(' · '); }
    case 'inventory': { const i = entry as InventoryItem; return `${i.kind} · ${formatNumber(i.weightKg)} kg`; }
    default: return (entry as Feature).source;
  }
}

function renderPicker() {
  const query = normalize(pickerSearch.value.trim());
  const predicate = filters[pickerKind].find(([value]) => value === pickerFilter.value)?.[2] ?? (() => true);
  const owned = new Set(listFor(pickerKind).map((entry) => normalize(entry.name)));
  const rows = catalog.flatMap((entry, i) => {
    if (!predicate(entry) || !normalize(`${entry.name} ${catalogDetail(pickerKind, entry)}`).includes(query)) return [];
    const row = document.createElement('li');
    row.className = 'item';
    row.dataset.tip = 'catalog';
    row.dataset.index = String(i);
    const main = document.createElement('div');
    main.className = 'row-main';
    const title = document.createElement('strong');
    title.textContent = entry.name;
    const detail = document.createElement('small');
    detail.textContent = catalogDetail(pickerKind, entry);
    main.append(title, detail);
    const end = document.createElement('span');
    end.className = 'row-end';
    if (owned.has(normalize(entry.name))) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = 'En la ficha';
      end.append(tag);
    }
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'button secondary';
    add.dataset.add = String(i);
    add.textContent = 'Añadir';
    add.setAttribute('aria-label', `Añadir ${entry.name}`);
    end.append(add);
    row.append(main, end);
    return [row];
  });
  pickerList.replaceChildren(...rows);
  if (!rows.length) pickerList.textContent = 'Nada coincide con la búsqueda.';
}

// Descripción de una entrada del listado calculada con los valores de este personaje.
registerTipSource('catalog', (el) => {
  const entry = catalog[Number(el.dataset.index)];
  return entry ? describe({ ...state, [pickerKind]: [entry] } as Character, `${pickerKind}:0`) : null;
});

async function loadCatalog(kind: Kind): Promise<Entry[]> {
  if (kind === 'spells') return (await import('../../data/spells')).spellCatalog;
  const data = await import('../../data/catalog');
  return { weapons: data.weaponCatalog, inventory: data.itemCatalog, features: data.featureCatalog }[kind];
}

root.addEventListener('click', async (event) => {
  const trigger = (event.target as Element).closest<HTMLElement>('[data-pick]');
  if (!trigger) return;
  pickerKind = trigger.dataset.pick as Kind;
  catalog = await loadCatalog(pickerKind);
  $('#pickerTitle').textContent = pickerTitles[pickerKind];
  $('#pickerStatus').textContent = '';
  pickerSearch.value = '';
  pickerFilter.replaceChildren(...filters[pickerKind].map(([value, label]) => new Option(label, value)));
  pickerFilter.hidden = filters[pickerKind].length < 2;
  renderPicker();
  picker.showModal();
  pickerSearch.focus();
});

pickerSearch.addEventListener('input', renderPicker);
pickerFilter.addEventListener('change', renderPicker);
pickerList.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-add]');
  if (!button) return;
  const entry = structuredClone(catalog[Number(button.dataset.add)]);
  if (pickerKind === 'weapons') (entry as Weapon).proficient = defaultWeaponProficiency(state, entry as Weapon);
  // Una armadura o escudo nuevo se equipa si su hueco (cuerpo o escudo) está libre.
  const armor = (entry as InventoryItem).armor;
  if (pickerKind === 'inventory' && armor) {
    const isShield = armor.kind === 'escudo';
    (entry as InventoryItem).equipped = !state.inventory.some((i) => i.equipped && i.armor && (i.armor.kind === 'escudo') === isShield);
  }
  update(() => {
    insert(pickerKind, entry);
    log(`${kinds[pickerKind].singular} añadido`, entry.name);
  });
  $('#pickerStatus').textContent = `Añadido: ${entry.name}`;
  renderPicker();
});
$('#pickerCustom').addEventListener('click', () => {
  picker.close();
  openEditor(pickerKind, null, kinds[pickerKind].blank());
});

// Botones de cierre comunes a todos los diálogos de la ficha.
document.querySelectorAll<HTMLElement>('dialog [data-close]').forEach((button) =>
  button.addEventListener('click', () => button.closest('dialog')!.close()),
);
