// Asistente de subida de nivel: PG (media o tirada), rasgo opcional y usos máximos de los
// rasgos con usos. Los espacios de los lanzadores completos se actualizan con su tabla.
import { fullCasterSlotsAt, hitDieAverage, modifier, rollExpression, signed } from '../../lib/sheet';
import { $, clamp, log, state, update } from './state';

const dialog = $<HTMLDialogElement>('#levelUp');
const wizard = dialog.querySelector('form')!;
const steps = [...dialog.querySelectorAll<HTMLElement>('[data-step]')];
const back = $<HTMLButtonElement>('#stepBack');
const next = $<HTMLButtonElement>('#stepNext');
const usesContainer = $('#levelUpUses');
let step = 0;
let hpRoll: number | undefined;

const conMod = () => modifier(state.abilities.con);
const rollsHp = () => (wizard.elements.namedItem('hp') as RadioNodeList).value === 'roll';
const hpGain = () => {
  const die = rollsHp() ? (hpRoll ??= rollExpression(`1${state.hitDice.die}`)!.total) : hitDieAverage(state.hitDice.die);
  return Math.max(1, die + conMod());
};
const field = (name: string) => String(new FormData(wizard).get(name) ?? '').trim();
const newFeature = () => ({ name: field('featureName'), source: `${state.className} ${state.level + 1}`.trim(), description: field('featureDescription') });
/** Usos máximos nuevos de cada rasgo con usos, indexados por su posición en `state.features`. */
const usesMaxima = () =>
  new Map([...usesContainer.querySelectorAll<HTMLInputElement>('input')].map((input) => [Number(input.dataset.feature), Math.max(0, input.valueAsNumber || 0)]));

function summary(): string[] {
  const level = state.level + 1;
  const lines = [`Nivel ${level}`, `PG máximos +${hpGain()}${rollsHp() ? ` (${state.hitDice.die} [${hpRoll}] ${signed(conMod())})` : ''}`];
  const feature = newFeature();
  if (feature.name) lines.push(`Rasgo nuevo: ${feature.name}`);
  const slots = fullCasterSlotsAt(state, level);
  if (slots) lines.push(`Espacios: ${slots.join(' / ')}`);
  for (const [i, max] of usesMaxima()) {
    const f = state.features[i];
    if (f.uses && max !== f.uses.max) lines.push(`${f.name}: ${f.uses.max} → ${max} usos`);
  }
  return lines;
}

function showStep(index: number) {
  step = index;
  steps.forEach((el, i) => (el.hidden = i !== step));
  $('#stepNumber').textContent = String(step + 1);
  back.hidden = step === 0;
  next.textContent = step === steps.length - 1 ? 'Confirmar subida' : 'Continuar';
  if (step === steps.length - 1) $('#levelUpSummary').textContent = summary().join(' · ');
}

function applyLevelUp() {
  const gain = hpGain();
  const feature = newFeature();
  const maxima = usesMaxima();
  const lines = summary();
  update(() => {
    state.level += 1;
    state.hp.max += gain;
    state.hp.current += gain;
    state.hitDice.max += 1;
    state.hitDice.current += 1;
    fullCasterSlotsAt(state, state.level)?.forEach((max, i) => {
      const slots = (state.spellSlots[String(i + 1)] ??= { current: 0, max: 0 });
      slots.current = Math.max(0, slots.current + max - slots.max);
      slots.max = max;
    });
    for (const [i, max] of maxima) {
      const uses = state.features[i].uses!;
      uses.current = clamp(uses.current + max - uses.max, 0, max);
      uses.max = max;
    }
    if (feature.name) state.features.push({ ...feature, uses: null });
    log(`Subida a nivel ${state.level}`, lines.slice(1).join(' · '));
  });
}

wizard.addEventListener('submit', (event) => event.preventDefault());
back.addEventListener('click', () => showStep(step - 1));
next.addEventListener('click', () => {
  if (step < steps.length - 1) return showStep(step + 1);
  applyLevelUp();
  dialog.close();
});

$('#openLevelUp').addEventListener('click', () => {
  wizard.reset();
  hpRoll = undefined;
  const average = hitDieAverage(state.hitDice.die);
  $('#hpAverageLabel').textContent = `Valor fijo: +${Math.max(1, average + conMod())} (${average} ${signed(conMod())} Con)`;
  $('#hpRollLabel').textContent = `Tirar ${state.hitDice.die} ${signed(conMod())} (se tira al revisar los cambios)`;
  $('#levelUpClass').textContent = `${state.className} ${state.subclass.toLowerCase()}`.trim();
  $('#levelUpSlotsNote').textContent = fullCasterSlotsAt(state, state.level + 1)
    ? 'Los espacios de conjuro se actualizan solos con la tabla de lanzador completo.'
    : 'Si tus espacios de conjuro cambian, ajústalos en la pestaña Grimorio.';
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
