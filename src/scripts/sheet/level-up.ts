// Asistente de subida de nivel: clase en la que se sube (una de las que ya tiene o una nueva,
// para la multiclase), PG (media o tirada con el dado de esa clase), rasgo opcional y usos
// máximos de los rasgos con usos. Los espacios se actualizan con la tabla de lanzador (completo,
// medio o combinado en multiclase) y la magia de pacto va aparte.
import {
  characterLevel,
  classInfo,
  classText,
  classList,
  hitDieAverage,
  modifier,
  pactSlotTable,
  rollExpression,
  signed,
  spellSlotTable,
  type CharacterClass,
} from '../../lib/sheet';
import { $, clamp, log, state, update } from './state';

const dialog = $<HTMLDialogElement>('#levelUp');
const wizard = dialog.querySelector('form')!;
const steps = [...dialog.querySelectorAll<HTMLElement>('[data-step]')];
const back = $<HTMLButtonElement>('#stepBack');
const next = $<HTMLButtonElement>('#stepNext');
const usesContainer = $('#levelUpUses');
const classSelect = $<HTMLSelectElement>('#levelClass');
let step = 0;
let hpRoll: number | undefined;

/** Clase elegida: índice en `state.classes` (`"0"`, `"1"`…) o `"nueva:Bárbaro"`. */
const chosen = () => {
  const value = classSelect.value;
  const name = value.startsWith('nueva:') ? value.slice(6) : state.classes[Number(value)].name;
  return { index: value.startsWith('nueva:') ? null : Number(value), name };
};
/** Clases tal como quedarán tras subir. */
function classesAfter(): CharacterClass[] {
  const { index, name } = chosen();
  const classes = state.classes.map((k) => ({ ...k }));
  if (index === null) classes.push({ name, subclass: '', level: 1 });
  else classes[index].level += 1;
  return classes;
}
/** Dado de golpe de la clase elegida; si es casera, el del primer tipo de dados de la ficha. */
const die = () => classInfo(chosen().name)?.hitDie ?? state.hitDice[0].die;
const conMod = () => modifier(state.abilities.con);
const rollsHp = () => (wizard.elements.namedItem('hp') as RadioNodeList).value === 'roll';
const hpGain = () => {
  const value = rollsHp() ? (hpRoll ??= rollExpression(`1${die()}`)!.total) : hitDieAverage(die());
  return Math.max(1, value + conMod());
};
const field = (name: string) => String(new FormData(wizard).get(name) ?? '').trim();
const classLevelAfter = () => {
  const { index } = chosen();
  return index === null ? 1 : state.classes[index].level + 1;
};
const newFeature = () => ({ name: field('featureName'), source: `${chosen().name} ${classLevelAfter()}`.trim(), description: field('featureDescription') });
/** Usos máximos nuevos de cada rasgo con usos, indexados por su posición en `state.features`. */
const usesMaxima = () =>
  new Map([...usesContainer.querySelectorAll<HTMLInputElement>('input')].map((input) => [Number(input.dataset.feature), Math.max(0, input.valueAsNumber || 0)]));

function summary(): string[] {
  const classes = classesAfter();
  const lines = [
    `Nivel ${characterLevel({ classes })}${classes.length > 1 ? ` · ${chosen().name} ${classLevelAfter()}` : ''}`,
    `PG máximos +${hpGain()}${rollsHp() ? ` (${die()} [${hpRoll}] ${signed(conMod())})` : ''}`,
  ];
  const feature = newFeature();
  if (feature.name) lines.push(`Rasgo nuevo: ${feature.name}`);
  const slots = spellSlotTable(classes);
  if (slots) lines.push(`Espacios: ${slots.map((max, i) => (max ? `${max} de nivel ${i + 1}` : '')).filter(Boolean).join(', ')}`);
  const pact = pactSlotTable(classes);
  if (pact) lines.push(`Espacios de pacto: ${pact.max} de nivel ${pact.level}`);
  for (const [i, max] of usesMaxima()) {
    const f = state.features[i];
    if (f.uses && max !== f.uses.max) lines.push(`${f.name}: ${f.uses.max} → ${max} usos`);
  }
  return lines;
}

/** Textos que dependen de la clase elegida: PG con su dado y la nota de espacios. */
function refreshClassTexts() {
  const average = hitDieAverage(die());
  $('#hpAverageLabel').textContent = `Valor fijo: +${Math.max(1, average + conMod())} (${average} ${signed(conMod())} Con)`;
  $('#hpRollLabel').textContent = `Tirar ${die()} ${signed(conMod())} (se tira al revisar los cambios)`;
  const classes = classesAfter();
  $('#levelUpSlotsNote').textContent = spellSlotTable(classes) || pactSlotTable(classes)
    ? 'Los espacios de conjuro se actualizan solos con la tabla de tu clase (en multiclase, con el nivel de lanzador combinado; el pacto, aparte).'
    : 'Tu clase no tiene tabla de espacios: si los tienes (p. ej. por subclase), ajústalos en la pestaña Grimorio.';
}

function showStep(index: number) {
  step = index;
  steps.forEach((el, i) => (el.hidden = i !== step));
  $('#stepNumber').textContent = String(step + 1);
  back.hidden = step === 0;
  next.textContent = step === steps.length - 1 ? 'Confirmar subida' : 'Continuar';
  if (step === steps.length - 1) {
    $('#levelUpClass').textContent = classText({ classes: classesAfter() });
    $('#levelUpSummary').textContent = summary().join(' · ');
  }
}

function applyLevelUp() {
  const gain = hpGain();
  const feature = newFeature();
  const maxima = usesMaxima();
  const lines = summary();
  const classes = classesAfter();
  const hitDie = die();
  const casting = classInfo(chosen().name)?.spellcasting ?? null;
  update(() => {
    state.classes = classes;
    state.hp.max += gain;
    state.hp.current += gain;
    // Dados de golpe por tipo: si la clase usa un dado que no tenía, se añade su fila.
    const pool = state.hitDice.find((dice) => dice.die === hitDie) ?? state.hitDice[state.hitDice.push({ die: hitDie, current: 0, max: 0 }) - 1];
    pool.max += 1;
    pool.current += 1;
    const table = spellSlotTable(classes);
    if (table) {
      // Los niveles que la tabla ya no incluye quedan a 0 y `normalize` los quita.
      for (let i = 0; i < 9; i++) {
        const max = table[i] ?? 0;
        const slots = state.spellSlots[String(i + 1)] ?? (max ? (state.spellSlots[String(i + 1)] = { current: 0, max: 0 }) : null);
        if (!slots) continue;
        slots.current = Math.max(0, slots.current + max - slots.max);
        slots.max = max;
      }
    }
    const pact = pactSlotTable(classes);
    if (pact) {
      const previous = state.pactSlots ?? { current: 0, max: 0 };
      state.pactSlots = { level: pact.level, max: pact.max, current: clamp(previous.current + pact.max - previous.max, 0, pact.max) };
    }
    // Al tomar la primera clase lanzadora, su aptitud mágica pasa a ser la del grimorio.
    if (!state.spellcastingAbility && casting) state.spellcastingAbility = casting;
    for (const [i, max] of maxima) {
      const uses = state.features[i].uses!;
      uses.current = clamp(uses.current + max - uses.max, 0, max);
      uses.max = max;
    }
    if (feature.name) state.features.push({ ...feature, uses: null });
    log(`Subida a nivel ${characterLevel({ classes })}`, lines.slice(1).join(' · '));
  });
}

/** Opciones de clase: las que ya tiene (por defecto, la primera) y las demás del juego como clase nueva. */
function fillClassOptions() {
  const owned = state.classes.map((k, i) => new Option(`${k.name || 'Clase sin nombre'} (nivel ${k.level} → ${k.level + 1})`, String(i)));
  const others = document.createElement('optgroup');
  others.label = 'Nueva clase (multiclase)';
  const ownedInfo = new Set(state.classes.map((k) => classInfo(k.name)));
  others.append(...classList.filter((info) => !ownedInfo.has(info)).map((info) => new Option(info.name, `nueva:${info.name}`)));
  classSelect.replaceChildren(...owned, others);
  classSelect.value = '0';
}

wizard.addEventListener('submit', (event) => event.preventDefault());
classSelect.addEventListener('change', () => {
  hpRoll = undefined; // el dado puede cambiar con la clase
  refreshClassTexts();
});
back.addEventListener('click', () => showStep(step - 1));
next.addEventListener('click', () => {
  if (step < steps.length - 1) return showStep(step + 1);
  applyLevelUp();
  dialog.close();
});

$('#openLevelUp').addEventListener('click', () => {
  wizard.reset();
  hpRoll = undefined;
  fillClassOptions();
  refreshClassTexts();
  usesContainer.replaceChildren(
    ...state.features.flatMap((feature, i) => {
      if (!feature.uses) return [];
      const label = document.createElement('label');
      label.className = 'stacked';
      label.textContent = `Usos máximos · ${feature.name}`;
      const input = document.createElement('input');
      input.className = 'field narrow';
      input.type = 'number';
      input.min = '0';
      input.value = String(feature.uses.max);
      input.dataset.feature = String(i);
      label.append(input);
      return [label];
    }),
  );
  showStep(0);
  dialog.showModal();
});
