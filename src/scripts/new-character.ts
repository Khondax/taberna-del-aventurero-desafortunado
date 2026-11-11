// Formulario de /nueva-ficha: recoge las elecciones, muestra el resumen en vivo y crea la
// ficha con la acción `importCharacter`, que la valida en el servidor.
import { actions, isInputError } from 'astro:actions';
import {
  buildCharacter,
  findClass,
  finalScores,
  pointBuyBudget,
  pointBuyCost,
  rollAbilityScore,
  standardArray,
  type CreationChoices,
} from '../lib/create';
import { currentSchemaVersion } from '../lib/ids';
import { abilities, abilityNames, abilityShort, armorClass, modifier, signed, skills, type Ability, type SkillId } from '../lib/sheet';

const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const form = $<HTMLFormElement>('#create');
const assignSelects = abilities.map((a) => $<HTMLSelectElement>(`[data-assign="${a}"]`));
const buyInputs = abilities.map((a) => $<HTMLInputElement>(`[data-buy="${a}"]`));
const bonusSelects = [0, 1, 2].map((i) => $<HTMLSelectElement>(`[data-bonus="${i}"]`));
const value = (name: string) => String(new FormData(form).get(name) ?? '').trim();
const method = () => value('method') as 'standard' | 'pointbuy' | 'roll';
const methodNames = { standard: 'matriz estándar', pointbuy: 'compra de puntos', roll: 'tiradas 4d6' };

let rolled: number[] = [];
const pool = () => (method() === 'roll' ? rolled : [...standardArray]);

/** Rellena los desplegables con los valores disponibles, conservando lo asignado si sigue siendo válido. */
function fillAssignOptions() {
  const values = pool();
  for (const select of assignSelects) {
    const previous = select.value;
    select.replaceChildren(new Option('—', ''), ...values.map((score, i) => new Option(String(score), String(i))));
    select.value = Number(previous) < values.length ? previous : '';
  }
}

// Cada valor del conjunto se usa una sola vez: elegirlo en otra característica lo libera de la anterior.
assignSelects.forEach((select) =>
  select.addEventListener('change', () => {
    for (const other of assignSelects) if (other !== select && other.value === select.value) other.value = '';
  }),
);

function baseScores(): Record<Ability, number> | null {
  if (method() === 'pointbuy') return Object.fromEntries(abilities.map((a, i) => [a, buyInputs[i].valueAsNumber])) as Record<Ability, number>;
  const values = pool();
  if (assignSelects.some((select) => select.value === '')) return null;
  return Object.fromEntries(abilities.map((a, i) => [a, values[Number(assignSelects[i].value)]])) as Record<Ability, number>;
}

function backgroundBonus(): Partial<Record<Ability, number>> {
  const amounts = value('bonusMode') === '2-1' ? [2, 1] : [1, 1, 1];
  const bonus: Partial<Record<Ability, number>> = {};
  amounts.forEach((amount, i) => {
    const ability = bonusSelects[i].value as Ability | '';
    if (ability) bonus[ability] = (bonus[ability] ?? 0) + amount;
  });
  return bonus;
}

/** Elecciones válidas o la lista de lo que falta. */
function readChoices(): { choices: CreationChoices | null; problems: string[] } {
  const problems: string[] = [];
  const name = value('name');
  if (!name) problems.push('Ponle nombre al personaje.');
  const classInfo = findClass(value('className'))!;
  const scores = baseScores();
  if (!scores) problems.push(method() === 'roll' && !rolled.length ? 'Tira las características.' : 'Asigna un valor a cada característica.');
  if (method() === 'pointbuy') {
    const cost = pointBuyCost(buyInputs.map((input) => input.valueAsNumber));
    if (cost === null) problems.push('En la compra de puntos cada característica va de 8 a 15.');
    else if (cost > pointBuyBudget) problems.push(`Has gastado ${cost} de ${pointBuyBudget} puntos.`);
  }
  const picked = bonusSelects.slice(0, value('bonusMode') === '2-1' ? 2 : 3).map((select) => select.value);
  if (picked.some((ability) => !ability)) problems.push('Elige las características del bonificador del trasfondo.');
  else if (new Set(picked).size !== picked.length) problems.push('El bonificador del trasfondo va a características distintas.');
  const chosenSkills = [...form.querySelectorAll<HTMLInputElement>('input[name="skills"]:checked')].map((input) => input.value as SkillId);
  if (problems.length || !scores) return { choices: null, problems };
  return {
    choices: {
      name, classInfo, species: value('species'), background: value('background'), alignment: value('alignment'),
      baseScores: scores, backgroundBonus: backgroundBonus(), skills: chosenSkills, method: methodNames[method()],
    },
    problems,
  };
}

function renderFacts(facts: [string, string][]) {
  const list = document.createElement('dl');
  for (const [label, text] of facts) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = text;
    list.append(dt, dd);
  }
  $('#summary').replaceChildren(list);
}

function render() {
  const current = method();
  assignSelects.forEach((select) => (select.hidden = current === 'pointbuy'));
  buyInputs.forEach((input) => (input.hidden = current !== 'pointbuy'));
  $('#rollPanel').hidden = current !== 'roll';
  bonusSelects[2].hidden = value('bonusMode') === '2-1';
  const cost = pointBuyCost(buyInputs.map((input) => input.valueAsNumber));
  $('#methodHelp').textContent = {
    standard: 'Reparte 15, 14, 13, 12, 10 y 8 entre tus características.',
    pointbuy: `Todas empiezan en 8 y puedes subirlas hasta 15. Puntos gastados: ${cost ?? '—'} de ${pointBuyBudget} (14 cuesta 7 y 15 cuesta 9).`,
    roll: 'Cada valor es la suma de los tres dados más altos de 4d6. Repártelos entre tus características.',
  }[current];

  const classInfo = findClass(value('className'))!;
  const suggested = new Set<string>(classInfo.skillChoices);
  form.querySelectorAll<HTMLElement>('[data-skill]').forEach((label) => label.classList.toggle('suggested', suggested.has(label.dataset.skill!)));
  const chosen = form.querySelectorAll('input[name="skills"]:checked').length;
  $('#skillCount').textContent = `${chosen} elegidas`;
  $('#skillHelp').textContent = `${classInfo.name}: elige ${classInfo.skillCount} entre las resaltadas. Tu trasfondo añade 2 más (cualquiera).`;

  const scores = baseScores();
  for (const ability of abilities) {
    const final = scores ? finalScores({ baseScores: scores, backgroundBonus: backgroundBonus() })[ability] : null;
    $(`[data-final="${ability}"]`).textContent = final === null ? '' : `final ${final} (${signed(modifier(final))})`;
  }

  const { choices, problems } = readChoices();
  $('#problems').replaceChildren(...problems.map((problem) => Object.assign(document.createElement('li'), { textContent: problem })));
  $<HTMLButtonElement>('#createButton').disabled = !choices;
  if (!choices) return renderFacts([['Clase', `${classInfo.name} · dado de golpe ${classInfo.hitDie}`]]);
  const c = buildCharacter(choices);
  renderFacts([
    ['Clase', `${c.className} de nivel 1 · dado de golpe ${c.hitDice.die}`],
    ['Características', abilities.map((a) => `${abilityShort(a)} ${c.abilities[a]}`).join(' · ')],
    ['PG', `${c.hp.max} = ${c.hitDice.die.slice(1)} + CON ${signed(modifier(c.abilities.con))}`],
    ['CA sin armadura', String(armorClass(c))],
    ['Salvaciones', c.savingThrows.map((a) => abilityNames[a]).join(' y ')],
    ['Habilidades', choices.skills.map((s) => skills[s].name).join(', ') || 'Ninguna'],
    ['Aptitud mágica', c.spellcastingAbility ? abilityNames[c.spellcastingAbility] : 'Ninguna'],
    ['Espacios', Object.entries(c.spellSlots).map(([level, slots]) => `${slots.max} de nivel ${level}`).join(', ') || 'Ninguno'],
    ['Rasgos de nivel 1', c.features.map((f) => f.name).join(', ') || 'Añádelos desde la ficha'],
  ]);
}

$('#rollScores').addEventListener('click', () => {
  const results = Array.from({ length: 6 }, () => rollAbilityScore());
  rolled = results.map((r) => r.total);
  $('#rollDetail').textContent = results.map((r) => `${r.total} [${r.dice.join(', ')}]`).join(' · ');
  fillAssignOptions();
  render();
});

form.addEventListener('change', (event) => {
  if ((event.target as HTMLInputElement).name === 'method') fillAssignOptions();
  render();
});
form.addEventListener('input', render);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { choices } = readChoices();
  if (!choices) return;
  const status = $('#createStatus');
  status.textContent = 'Creando…';
  const { data, error } = await actions.importCharacter({ schemaVersion: currentSchemaVersion, character: buildCharacter(choices) });
  if (error) {
    const issue = isInputError(error) ? error.issues[0] : undefined;
    status.textContent = issue ? `No se pudo crear: ${issue.path.join('.')} · ${issue.message}` : `No se pudo crear: ${error.message}`;
    return;
  }
  location.href = `/personajes/${data.slug}`;
});

fillAssignOptions();
render();
