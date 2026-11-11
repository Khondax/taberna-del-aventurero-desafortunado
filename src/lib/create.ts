// Creación de un personaje de nivel 1 (página /nueva-ficha). Funciones puras: el formulario
// recoge las elecciones y `buildCharacter` produce la ficha que se envía a `importCharacter`.
import { featureCatalog } from '../data/catalog';
import { findBackground, findSpecies } from '../data/origins';
import { abilities, classList, modifier, pactSlotTable, spellSlotTable, type Ability, type Character, type ClassInfo, type SkillId } from './sheet';

export const standardArray = [15, 14, 13, 12, 10, 8] as const;
export const pointBuyBudget = 27;
const pointBuyCosts: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

/** Puntos gastados en la compra de puntos, o `null` si alguna puntuación está fuera de 8–15. */
export function pointBuyCost(scores: number[]): number | null {
  let total = 0;
  for (const score of scores) {
    if (!(score in pointBuyCosts)) return null;
    total += pointBuyCosts[score];
  }
  return total;
}

/** 4d6 descartando el menor. */
export function rollAbilityScore(random = Math.random): { dice: number[]; total: number } {
  const dice = Array.from({ length: 4 }, () => Math.floor(random() * 6) + 1);
  const total = dice.reduce((a, b) => a + b, 0) - Math.min(...dice);
  return { dice, total };
}

export interface CreationChoices {
  name: string;
  /** Especie y trasfondo: si están en `src/data/origins.ts` se aplican sus datos; si no, son texto libre. */
  species: string;
  classInfo: ClassInfo;
  background: string;
  alignment: string;
  /** Puntuaciones antes del bonificador del trasfondo. */
  baseScores: Record<Ability, number>;
  /** Bonificadores del trasfondo: +2/+1 o +1/+1/+1 (con un trasfondo del listado, entre sus tres características). */
  backgroundBonus: Partial<Record<Ability, number>>;
  /** Habilidades elegidas; las del trasfondo del listado se añaden solas. */
  skills: SkillId[];
  method: string;
}

/** Puntuaciones finales: base + trasfondo, con un máximo de 20. */
export const finalScores = (choices: Pick<CreationChoices, 'baseScores' | 'backgroundBonus'>) =>
  Object.fromEntries(abilities.map((a) => [a, Math.min(20, choices.baseScores[a] + (choices.backgroundBonus[a] ?? 0))])) as Record<Ability, number>;

export const findClass = (name: string) => classList.find((info) => info.name === name);

/**
 * Ficha de nivel 1. Un trasfondo del listado añade sus dos habilidades y su dote de origen; una
 * especie del listado pone su velocidad y sus rasgos.
 */
export function buildCharacter(choices: CreationChoices): Character {
  const { classInfo: info } = choices;
  const background = findBackground(choices.background);
  const species = findSpecies(choices.species);
  const scores = finalScores(choices);
  const hpMax = Math.max(1, Number(info.hitDie.slice(1)) + modifier(scores.con));
  const character: Character = {
    name: choices.name,
    species: choices.species,
    classes: [{ name: info.name, subclass: '', level: 1 }],
    background: choices.background,
    alignment: choices.alignment,
    xp: 0,
    abilities: scores,
    acBonus: 0,
    speed: species?.speed ?? '9 m',
    hp: { current: hpMax, max: hpMax, temp: 0 },
    hitDice: [{ current: 1, max: 1, die: info.hitDie }],
    deathSaves: { successes: 0, failures: 0, stable: false },
    concentration: null,
    conditions: [],
    exhaustion: 0,
    savingThrows: [...info.saves],
    skills: Object.fromEntries([...(background?.skills ?? []), ...choices.skills].map((skill) => [skill, 1])),
    spellcastingAbility: info.spellcasting,
    spellSlots: {},
    pactSlots: null,
    // Rasgos de nivel 1 de la clase que hay en el listado (p. ej. Furia, Tomar aliento), de la especie y la dote de origen.
    features: [
      ...featureCatalog.filter((feature) => feature.source === `${info.name} 1`),
      ...(species?.traits ?? []),
      ...(background ? [background.feat] : []),
    ].map((feature) => structuredClone(feature)),
    spells: [],
    weapons: [],
    inventory: [],
    coins: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 },
    history: [{ date: new Date().toISOString(), title: 'Personaje creado', detail: `${info.name} de nivel 1 · ${choices.method}` }],
    notes: '',
  };
  spellSlotTable(character.classes)?.forEach((max, i) => {
    if (max) character.spellSlots[String(i + 1)] = { current: max, max };
  });
  const pact = pactSlotTable(character.classes);
  if (pact) character.pactSlots = { ...pact, current: pact.max };
  return character;
}
