// Punto de entrada de la ficha (/personajes/[slug]): pintado, campos editables, tiradas,
// recursos y descansos. La edición de listas, el tooltip y la subida de nivel viven en sus
// propios módulos.
import {
  abilityMod,
  abilityNames,
  featureRow,
  historyRow,
  initials,
  itemRow,
  liveBars,
  liveText,
  normalize,
  pips,
  resourceRows,
  rollExpression,
  saveBonus,
  signed,
  skillBonus,
  skills,
  slotRows,
  spellAttackBonus,
  spellDice,
  spellcastingMod,
  spellRow,
  spellSaveDC,
  weaponAttack,
  weaponDamageBonus,
  weaponRow,
  type Ability,
  type Pool,
  type ResourceRow,
  type Row,
  type SkillId,
} from '../../lib/sheet';
import { $, canUndo, clamp, commit, currentFile, getPath, log, onRender, render, root, setPath, slug, state, undo, update } from './state';
import './tooltip';
import './entries';
import './level-up';

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
}

function fillResource(row: HTMLElement, data: ResourceRow) {
  row.dataset.key = data.key;
  setFields(row, { title: data.title, detail: data.detail, pips: pips(data.pool), count: `${data.pool.current} / ${data.pool.max}` });
  row.querySelector('[data-delta="-1"]')!.setAttribute('aria-label', `Gastar: ${data.title}`);
  row.querySelector('[data-delta="1"]')!.setAttribute('aria-label', `Recuperar: ${data.title}`);
  const max = row.querySelector<HTMLInputElement>('.max-input input')!;
  if (data.key.startsWith('slot:')) {
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
  renderList('slotList', 'resourceTemplate', slotRows(state), fillResource);
  renderList('history', 'plainTemplate', state.history.map(historyRow).reverse(), (row, data) => fillRow(row, data));
  filterInputs.forEach(applyFilter);

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
    const level = kind === 'saves' ? Number(state.savingThrows.includes(id as Ability)) : state.skills[id as SkillId] ?? 0;
    button.setAttribute('aria-pressed', String(level > 0));
  });

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
function showResult(label: string, value: string) {
  $('#rollLabel').textContent = label;
  $('#rollValue').textContent = value;
  toast.hidden = false;
}
$('#closeRoll').addEventListener('click', () => (toast.hidden = true));

const d20 = () => rollExpression('1d20')!.total;
const check = (label: string, bonus: number) => {
  const die = d20();
  showResult(`${label} · d20 [${die}] ${signed(bonus)}${die === 20 ? ' · ¡20 natural!' : die === 1 ? ' · 1 natural' : ''}`, String(die + bonus));
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
    const attack = die + weaponAttack(state, weapon);
    const damage = rollDamage(weapon.damage, weaponDamageBonus(state, weapon), die === 20);
    return showResult(
      `${weapon.name} · ataque d20 [${die}] ${signed(weaponAttack(state, weapon))} = ${attack}${die === 20 ? ' · ¡crítico!' : ''} · daño ${damage?.text ?? weapon.damage}`,
      `${damage?.total ?? '?'} ${weapon.damageType}`.trim(),
    );
  }
  if (kind === 'spells') {
    const spell = state.spells[Number(id)];
    const parts: string[] = [spell.name];
    let critical = false;
    if (spell.attack) {
      const die = d20();
      critical = die === 20;
      parts.push(`ataque d20 [${die}] ${signed(spellAttackBonus(state))} = ${die + spellAttackBonus(state)}${critical ? ' · ¡crítico!' : ''}`);
    }
    if (spell.save) parts.push(`salvación de ${abilityNames[spell.save]} CD ${spellSaveDC(state)}`);
    const effect = spell.effect ? rollDamage(spellDice(state, spell), spell.effect.addModifier ? spellcastingMod(state) : 0, critical) : null;
    if (effect) parts.push(effect.text);
    return showResult(parts.join(' · '), effect ? `${effect.total} ${spell.effect!.type}` : '—');
  }
}

root.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-roll]');
  if (!button) return;
  rollEntry(button.dataset.roll || button.closest<HTMLElement>('[data-entry]')!.dataset.entry!);
});

// --- Puntos de golpe, recursos y descansos -------------------------------------------------

$<HTMLFormElement>('#hpForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const amount = Number(new FormData(event.currentTarget as HTMLFormElement).get('amount'));
  const direction = Number((event.submitter as HTMLButtonElement | null)?.value ?? -1);
  update(() => (state.hp.current = clamp(state.hp.current + direction * amount, 0, state.hp.max)));
  showResult(`${direction < 0 ? 'Daño' : 'Curación'} · ${amount}`, `${state.hp.current} PG`);
});

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

$('#addSlotLevel').addEventListener('click', () => {
  const next = Array.from({ length: 9 }, (_, i) => String(i + 1)).find((level) => !state.spellSlots[level]);
  if (next) update(() => (state.spellSlots[next] = { current: 1, max: 1 }));
});

const usesEntries = () => [...state.features, ...state.inventory].filter((entry) => entry.uses);

$('#shortRest').addEventListener('click', () => {
  const recovered = usesEntries().filter((entry) => entry.uses!.recovery === 'corto' && entry.uses!.current < entry.uses!.max);
  update(() => {
    recovered.forEach((entry) => (entry.uses!.current = entry.uses!.max));
    log('Descanso corto', recovered.length ? `Recuperado: ${recovered.map((entry) => entry.name).join(', ')}` : 'Sin recursos que recuperar');
  });
  showResult('Descanso corto · gasta dados de golpe para curarte', '✓');
});

$('#longRest').addEventListener('click', () => {
  update(() => {
    state.hp.current = state.hp.max;
    state.hitDice.current = state.hitDice.max;
    Object.values(state.spellSlots).forEach((slots) => (slots.current = slots.max));
    usesEntries().forEach((entry) => entry.uses!.recovery !== 'ninguna' && (entry.uses!.current = entry.uses!.max));
    log('Descanso largo', 'PG, dados de golpe, espacios y usos restaurados');
  });
  showResult('Descanso largo · todo restaurado', '✓');
});

// --- Notas, exportación y deshacer -----------------------------------------------------------

$<HTMLTextAreaElement>('#notes').addEventListener('input', (event) => {
  state.notes = (event.target as HTMLTextAreaElement).value;
  commit(); // Las notas se guardan sin pasar por `update`: no entran en deshacer.
});

$('#export').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`${JSON.stringify(currentFile(), null, 2)}\n`], { type: 'application/json' }));
  link.download = `${slug}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

$('#undo').addEventListener('click', undo);

render();
