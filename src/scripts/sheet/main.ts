// Punto de entrada de la ficha (/personajes/[slug]): pintado, campos editables, tiradas,
// recursos y descansos. La edición de listas, el tooltip, la subida de nivel y la pestaña
// Gestión viven en sus propios módulos.
import {
  abilityMod,
  abilityNames,
  concentrationOptions,
  deathSave,
  exhaustionPenalty,
  featureRow,
  gainTempHp,
  heal,
  hasPactMagic,
  historyRow,
  initials,
  itemRow,
  liveBars,
  liveText,
  normalize,
  pips,
  proficiencyLabels,
  resourceRows,
  rollExpression,
  saveBonus,
  saveLevel,
  signed,
  skillBonus,
  skillLevel,
  skills,
  spellAttackBonus,
  spellDice,
  spellcastingMod,
  spellRow,
  spellSaveDC,
  takeDamage,
  weaponAttack,
  weaponDamageBonus,
  weaponRow,
  type Ability,
  type DeathSaveOutcome,
  type Pool,
  type ResourceRow,
  type Row,
  type SkillId,
} from '../../lib/sheet';
import { $, canUndo, clamp, commit, getPath, log, onRender, render, root, setPath, state, undo, update } from './state';
import './tooltip';
import './entries';
import './level-up';
import './manage';

// --- Pintado -------------------------------------------------------------------------

function setFields(row: Element, fields: Record<string, string>) {
  for (const [field, value] of Object.entries(fields)) {
    const el = row.querySelector(`[data-field="${field}"]`);
    if (el) el.textContent = value;
  }
}

/** Rellena una fila de lista; `entry` es su clave (`spells:3`) para tooltip, edición y tirada. */
function fillRow(row: HTMLElement, data: Row, entry?: string, rollable = false) {
  setFields(row, { ...data });
  if (entry) {
    row.dataset.entry = entry;
    row.dataset.tip = 'entry';
  }
  const roll = row.querySelector<HTMLElement>('[data-roll]');
  if (roll) {
    roll.hidden = !rollable;
    roll.setAttribute('aria-label', `Tirar: ${data.title}`);
  }
  row.querySelector('[data-remove]')?.setAttribute('aria-label', `Quitar: ${data.title}`);
}

function fillResource(row: HTMLElement, data: ResourceRow) {
  row.dataset.key = data.key;
  setFields(row, { title: data.title, detail: data.detail, pips: pips(data.pool), count: `${data.pool.current} / ${data.pool.max}` });
  row.querySelector('[data-delta="-1"]')!.setAttribute('aria-label', `Gastar: ${data.title}`);
  row.querySelector('[data-delta="1"]')!.setAttribute('aria-label', `Recuperar: ${data.title}`);
  row.querySelector('[data-remove-resource]')!.setAttribute('aria-label', `Quitar: ${data.title}`);
  const max = row.querySelector<HTMLInputElement>('.max-input input')!;
  const isSlot = data.key.startsWith('slot:');
  max.parentElement!.hidden = !isSlot;
  if (isSlot) {
    max.dataset.path = `spellSlots.${data.key.slice(5)}.max`;
    max.setAttribute('aria-label', `Máximo: ${data.title}`);
  } else delete max.dataset.path;
}

/** Sincroniza una lista con `items`, reutilizando las filas existentes para no perder el foco. */
function renderList<T>(listId: string, templateId: string, items: T[], fill: (row: HTMLElement, item: T, index: number) => void) {
  const list = $(`#${listId}`);
  const template = $<HTMLTemplateElement>(`#${templateId}`).content.firstElementChild!;
  items.forEach((item, i) => {
    const row = (list.children[i] as HTMLElement | undefined) ?? list.appendChild(template.cloneNode(true) as HTMLElement);
    fill(row, item, i);
  });
  while (list.children.length > items.length) list.lastElementChild!.remove();
}

onRender(() => {
  renderList('weapons', 'entryTemplate', state.weapons, (row, w, i) => fillRow(row, weaponRow(state, w), `weapons:${i}`, true));
  renderList('spells', 'entryTemplate', state.spells, (row, s, i) => fillRow(row, spellRow(state, s), `spells:${i}`, Boolean(s.effect) || s.attack));
  renderList('inventory', 'entryTemplate', state.inventory, (row, item, i) => fillRow(row, itemRow(item), `inventory:${i}`));
  renderList('features', 'featureTemplate', state.features, (row, f, i) => fillRow(row, featureRow(f), `features:${i}`));
  renderList('resources', 'resourceTemplate', resourceRows(state), fillResource);
  renderList('history', 'plainTemplate', state.history.map(historyRow).reverse(), (row, data) => fillRow(row, data));
  filterInputs.forEach(applyFilter);

  // Las opciones de concentración se rehacen solo si cambian, para no cerrar el desplegable.
  const concentration = $<HTMLSelectElement>('[data-path="concentration"]');
  const options = ['', ...concentrationOptions(state)];
  if ([...concentration.options].map((option) => option.value).join('\n') !== options.join('\n')) {
    concentration.replaceChildren(...options.map((name) => new Option(name || 'Ninguna', name)));
  }

  const text = liveText(state);
  const bars = liveBars(state);
  document.querySelectorAll<HTMLElement>('[data-bind]').forEach((el) => {
    el.textContent = el.dataset.bind === 'initials' ? initials(state.name) : text[el.dataset.bind!];
  });
  document.querySelectorAll<HTMLElement>('[data-bar]').forEach((el) => (el.style.width = bars[el.dataset.bar!]));
  // Los campos editables muestran el estado, salvo el que se está escribiendo.
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-path]').forEach((input) => {
    if (input !== document.activeElement) input.value = String(getPath(state, input.dataset.path!) ?? '');
  });
  document.querySelectorAll<HTMLElement>('[data-toggle]').forEach((button) => {
    const [kind, id] = button.dataset.toggle!.split(':');
    const level = kind === 'saves' ? saveLevel(state, id as Ability) : skillLevel(state, id as SkillId);
    button.dataset.level = String(level);
    button.title = proficiencyLabels[level];
    button.setAttribute('aria-pressed', String(level > 0));
  });

  $('#deathSaves').hidden = state.hp.current > 0;
  document.querySelectorAll<HTMLInputElement>('[data-death]').forEach((box) => {
    box.checked = state.deathSaves[box.dataset.death as 'successes' | 'failures'] >= Number(box.dataset.n);
  });
  $<HTMLButtonElement>('#rollDeathSave').disabled = state.deathSaves.stable || state.deathSaves.failures >= 3;
  $<HTMLButtonElement>('#endConcentration').disabled = !state.concentration;

  $<HTMLButtonElement>('#undo').disabled = !canUndo();
  $<HTMLButtonElement>('#spendHitDie').disabled = state.hitDice.current === 0 || state.hp.current === state.hp.max;
  $('#spendHitDie').textContent = `Gastar dado de golpe (${state.hitDice.die} ${signed(abilityMod(state, 'con'))})`;
  $<HTMLButtonElement>('#openLevelUp').disabled = state.level >= 20;
  document.title = `${state.name} · La Taberna`;
});

// --- Campos editables ----------------------------------------------------------------

/** Convierte el valor de un campo; `undefined` si no es válido (el render lo restaura). */
function readInput(input: HTMLInputElement | HTMLSelectElement): unknown {
  if (input instanceof HTMLSelectElement) return input.value === '' ? null : input.value;
  if (input.type !== 'number') {
    const value = input.value.trim();
    return input.required && !value ? undefined : value;
  }
  const value = input.valueAsNumber;
  if (!Number.isFinite(value)) return undefined;
  return clamp(Math.round(value), input.min === '' ? -Infinity : Number(input.min), input.max === '' ? Infinity : Number(input.max));
}

root.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement | HTMLSelectElement;
  const path = input.dataset.path;
  if (!path) return;
  const value = readInput(input);
  if (value === undefined || value === getPath(state, path)) return render();
  update(() => setPath(state, path, value));
});

root.addEventListener('keydown', (event) => {
  const input = event.target as HTMLElement;
  if (event.key === 'Enter' && input instanceof HTMLInputElement && input.dataset.path) input.blur();
});

root.addEventListener('click', (event) => {
  const toggle = (event.target as Element).closest<HTMLElement>('[data-toggle]');
  if (!toggle) return;
  const [kind, id] = toggle.dataset.toggle!.split(':');
  update(() => {
    if (kind === 'saves') {
      const ability = id as Ability;
      state.savingThrows = state.savingThrows.includes(ability)
        ? state.savingThrows.filter((a) => a !== ability)
        : [...state.savingThrows, ability];
    } else {
      const skill = id as SkillId;
      state.skills[skill] = (((state.skills[skill] ?? 0) + 1) % 3) as 0 | 1 | 2;
    }
  });
});

// --- Pestañas (patrón ARIA tabs; la pestaña activa queda en el hash) ------------------

const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
function selectTab(selected: HTMLButtonElement, focus = true) {
  for (const tab of tabs) {
    const isSelected = tab === selected;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    $(`#${tab.getAttribute('aria-controls')}`).hidden = !isSelected;
  }
  history.replaceState(null, '', `#${selected.getAttribute('aria-controls')}`);
  if (focus) selected.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const step = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[event.key];
    if (step) selectTab(tabs[(i + step + tabs.length) % tabs.length]);
  });
});
const initialTab = tabs.find((tab) => `#${tab.getAttribute('aria-controls')}` === location.hash);
if (initialTab) selectTab(initialTab, false);

// --- Búsqueda en listas, sin distinguir mayúsculas ni tildes ---------------------------

const filterInputs = [...document.querySelectorAll<HTMLInputElement>('[data-filter]')];
function applyFilter(input: HTMLInputElement) {
  const query = normalize(input.value.trim());
  for (const row of $(`#${input.dataset.filter}`).children as HTMLCollectionOf<HTMLElement>) {
    row.hidden = !normalize(row.textContent ?? '').includes(query);
  }
}
filterInputs.forEach((input) => input.addEventListener('input', () => applyFilter(input)));

// --- Tiradas ---------------------------------------------------------------------------

const toast = $('#rollResult');
const toastAction = $<HTMLButtonElement>('#rollAction');
let runToastAction: (() => void) | null = null;
/** Muestra un resultado. `action` añade un botón para el siguiente paso (p. ej. la salvación de concentración). */
function showResult(label: string, value: string, action?: { label: string; run: () => void }) {
  $('#rollLabel').textContent = label;
  $('#rollValue').textContent = value;
  toastAction.hidden = !action;
  toastAction.textContent = action?.label ?? '';
  runToastAction = action?.run ?? null;
  toast.hidden = false;
}
toastAction.addEventListener('click', () => runToastAction?.());
$('#closeRoll').addEventListener('click', () => (toast.hidden = true));

const d20 = () => rollExpression('1d20')!.total;
/** Texto del agotamiento para las tiradas d20, que ya lo restan en `bonus`. */
const exhaustionText = () => (state.exhaustion ? ` (agotamiento −${exhaustionPenalty(state)})` : '');
/** Prueba d20 + `bonus` − agotamiento. Devuelve el total. */
const check = (label: string, bonus: number) => {
  const die = d20();
  const total = bonus - exhaustionPenalty(state);
  showResult(`${label} · d20 [${die}] ${signed(total)}${exhaustionText()}${die === 20 ? ' · ¡20 natural!' : die === 1 ? ' · 1 natural' : ''}`, String(die + total));
  return die + total;
};
/** Tira daño; en un crítico se duplican los dados (no el modificador). */
function rollDamage(dice: string, bonus: number, critical: boolean) {
  const doubled = critical ? dice.replace(/^(\d+)d/, (_, n) => `${Number(n) * 2}d`) : dice;
  const result = rollExpression(doubled);
  return result ? { text: `${doubled} [${result.rolls.join(', ')}] ${bonus ? signed(bonus) : ''}`.trim(), total: Math.max(0, result.total + bonus) } : null;
}

function rollEntry(key: string) {
  const [kind, id] = key.split(':');
  if (kind === 'abilities') return check(abilityNames[id as Ability], abilityMod(state, id as Ability));
  if (kind === 'saves') return check(`Salvación de ${abilityNames[id as Ability]}`, saveBonus(state, id as Ability));
  if (kind === 'skills') return check(skills[id as SkillId].name, skillBonus(state, id as SkillId));
  if (kind === 'weapons') {
    const weapon = state.weapons[Number(id)];
    const die = d20();
    const bonus = weaponAttack(state, weapon) - exhaustionPenalty(state);
    const damage = rollDamage(weapon.damage, weaponDamageBonus(state, weapon), die === 20);
    return showResult(
      `${weapon.name} · ataque d20 [${die}] ${signed(bonus)}${exhaustionText()} = ${die + bonus}${die === 20 ? ' · ¡crítico!' : ''} · daño ${damage?.text ?? weapon.damage}`,
      `${damage?.total ?? '?'} ${weapon.damageType}`.trim(),
    );
  }
  if (kind === 'spells') {
    const spell = state.spells[Number(id)];
    const parts: string[] = [spell.name];
    let critical = false;
    if (spell.attack) {
      const die = d20();
      const bonus = spellAttackBonus(state) - exhaustionPenalty(state);
      critical = die === 20;
      parts.push(`ataque d20 [${die}] ${signed(bonus)}${exhaustionText()} = ${die + bonus}${critical ? ' · ¡crítico!' : ''}`);
    }
    if (spell.save) parts.push(`salvación de ${abilityNames[spell.save]} CD ${spellSaveDC(state)}`);
    const effect = spell.effect ? rollDamage(spellDice(state, spell), spell.effect.addModifier ? spellcastingMod(state) : 0, critical) : null;
    if (effect) parts.push(effect.text);
    // Lanzar un conjuro de concentración sustituye al anterior.
    if (spell.concentration && state.concentration !== spell.name) {
      parts.push(state.concentration ? `concentración (sustituye a ${state.concentration})` : 'concentración');
      update(() => (state.concentration = spell.name));
    }
    return showResult(parts.join(' · '), effect ? `${effect.total} ${spell.effect!.type}` : '—');
  }
}

root.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-roll]');
  if (!button) return;
  rollEntry(button.dataset.roll || button.closest<HTMLElement>('[data-entry]')!.dataset.entry!);
});

// --- Puntos de golpe, recursos y descansos -------------------------------------------------

const hpText = () => `${state.hp.current} PG${state.hp.temp ? ` + ${state.hp.temp} temp.` : ''}`;

/** Salvación de Constitución para mantener la concentración; si falla, la pierde. */
function rollConcentration(dc: number) {
  const spell = state.concentration;
  if (!spell) return;
  const total = check(`Concentración en ${spell} · salvación de Constitución CD ${dc}`, saveBonus(state, 'con'));
  if (total < dc) {
    update(() => (state.concentration = null));
    $('#rollLabel').textContent += ` · pierdes la concentración`;
  } else $('#rollLabel').textContent += ` · mantienes la concentración`;
}

/** Daño, curación o PG temporales desde los formularios de PG (`.hp-form`). */
function applyHp(direction: string, amount: number) {
  if (direction === 'temp') {
    update(() => gainTempHp(state, amount));
    return showResult(`PG temporales · ${amount} (no se acumulan: queda el mayor)`, hpText());
  }
  if (direction === '1') {
    update(() => heal(state, amount));
    return showResult(`Curación · ${amount}`, hpText());
  }
  const wasDown = state.hp.current === 0;
  const failures = state.deathSaves.failures;
  let dc = null as number | null;
  update(() => (dc = takeDamage(state, amount)));
  const parts = [`Daño · ${amount}`];
  if (wasDown && state.deathSaves.failures > failures) parts.push('fallo de salvación contra la muerte');
  else if (state.hp.current === 0) parts.push('inconsciente');
  if (dc === null) return showResult(parts.join(' · '), hpText());
  const save = dc;
  parts.push(`concentración en ${state.concentration}: salvación de Constitución CD ${save}`);
  showResult(parts.join(' · '), hpText(), { label: `Tirar salvación (CD ${save})`, run: () => rollConcentration(save) });
}

document.querySelectorAll<HTMLFormElement>('.hp-form').forEach((form) =>
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = Number(new FormData(form).get('amount'));
    applyHp((event.submitter as HTMLButtonElement | null)?.value ?? '-1', amount);
  }),
);

// Casillas de salvación contra la muerte: marcar la n.ª deja n; desmarcarla, n − 1.
root.addEventListener('change', (event) => {
  const box = event.target as HTMLInputElement;
  const kind = box.dataset.death as 'successes' | 'failures' | undefined;
  if (!kind) return;
  update(() => (state.deathSaves[kind] = Number(box.dataset.n) - (box.checked ? 0 : 1)));
});

const deathSaveText: Record<DeathSaveOutcome, string> = { recupera: '¡20 natural! Recuperas 1 PG', exito: 'éxito', estable: 'tres éxitos: estabilizado', fallo: 'fallo', muerte: 'tres fallos: ha muerto' };
$('#rollDeathSave').addEventListener('click', () => {
  const die = d20();
  let outcome = 'fallo' as DeathSaveOutcome;
  update(() => (outcome = deathSave(state, die)));
  const penalty = state.exhaustion ? ` ${signed(-exhaustionPenalty(state))}${exhaustionText()}` : '';
  const result = die === 1 ? '1 natural: dos fallos' : deathSaveText[outcome];
  showResult(`Salvación contra la muerte · d20 [${die}]${penalty} · ${result}`, outcome === 'recupera' ? '1 PG' : String(die - exhaustionPenalty(state)));
});

$('#endConcentration').addEventListener('click', () => update(() => (state.concentration = null)));

$('#spendHitDie').addEventListener('click', () => {
  const die = rollExpression(`1${state.hitDice.die}`)!.total;
  const healed = Math.max(1, die + abilityMod(state, 'con'));
  update(() => {
    state.hitDice.current -= 1;
    state.hp.current = Math.min(state.hp.max, state.hp.current + healed);
  });
  showResult(`Dado de golpe · ${state.hitDice.die} [${die}] ${signed(abilityMod(state, 'con'))}`, `+${healed} PG`);
});

function poolFor(key: string): Pool {
  const [kind, id] = key.split(':');
  if (kind === 'slot') return state.spellSlots[id];
  return (kind === 'features' ? state.features : state.inventory)[Number(id)].uses!;
}

root.addEventListener('click', (event) => {
  const step = (event.target as Element).closest<HTMLElement>('[data-delta]');
  if (!step) return;
  const pool = poolFor(step.closest<HTMLElement>('[data-key]')!.dataset.key!);
  const next = clamp(pool.current + Number(step.dataset.delta), 0, pool.max);
  if (next !== pool.current) update(() => (pool.current = next));
});

// Quitar un recurso: un nivel de espacios desaparece; un rasgo u objeto se queda, pero sin usos.
root.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-remove-resource]');
  if (!button) return;
  const [kind, id] = button.closest<HTMLElement>('[data-key]')!.dataset.key!.split(':');
  update(() => {
    if (kind === 'slot') {
      delete state.spellSlots[id];
      log('Espacios quitados', `Nivel ${id}`);
    } else {
      const entry = (kind === 'features' ? state.features : state.inventory)[Number(id)];
      entry.uses = null;
      log('Usos quitados', entry.name);
    }
  });
});

$('#addSlotLevel').addEventListener('click', () => {
  const next = Array.from({ length: 9 }, (_, i) => String(i + 1)).find((level) => !state.spellSlots[level]);
  if (next) update(() => (state.spellSlots[next] = { current: 1, max: 1 }));
});

const usesEntries = () => [...state.features, ...state.inventory].filter((entry) => entry.uses);

$('#shortRest').addEventListener('click', () => {
  const recovered = usesEntries()
    .filter((entry) => entry.uses!.recovery === 'corto' && entry.uses!.current < entry.uses!.max)
    .map((entry) => entry.name);
  const pact = hasPactMagic(state) && Object.values(state.spellSlots).some((slots) => slots.current < slots.max);
  if (pact) recovered.push('espacios de pacto');
  update(() => {
    for (const entry of usesEntries()) if (entry.uses!.recovery === 'corto') entry.uses!.current = entry.uses!.max;
    if (hasPactMagic(state)) Object.values(state.spellSlots).forEach((slots) => (slots.current = slots.max));
    log('Descanso corto', recovered.length ? `Recuperado: ${recovered.join(', ')}` : 'Sin recursos que recuperar');
  });
  showResult('Descanso corto · gasta dados de golpe para curarte', '✓');
});

$('#longRest').addEventListener('click', () => {
  update(() => {
    state.hp.current = state.hp.max;
    state.hp.temp = 0;
    state.hitDice.current = state.hitDice.max;
    Object.values(state.spellSlots).forEach((slots) => (slots.current = slots.max));
    usesEntries().forEach((entry) => entry.uses!.recovery !== 'ninguna' && (entry.uses!.current = entry.uses!.max));
    const exhausted = state.exhaustion > 0;
    if (exhausted) state.exhaustion -= 1;
    log('Descanso largo', `PG, dados de golpe, espacios y usos restaurados${exhausted ? ' · agotamiento −1' : ''}`);
  });
  showResult('Descanso largo · todo restaurado', '✓');
});

// --- Notas y deshacer -----------------------------------------------------------

$<HTMLTextAreaElement>('#notes').addEventListener('input', (event) => {
  state.notes = (event.target as HTMLTextAreaElement).value;
  commit(); // Las notas se guardan sin pasar por `update`: no entran en deshacer.
});

$('#undo').addEventListener('click', undo);

render();
