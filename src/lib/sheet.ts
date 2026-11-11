// Reglas D&D 2024 y valores derivados de una ficha. Lo comparten el render en servidor
// y el script de cliente, para que ambos muestren exactamente lo mismo.
import { abilities, coinIds, conditionIds, skillIds, type Ability, type CoinId, type ConditionId, type SkillId } from './ids';
import type { Character, Feature, InventoryItem, Pool, Spell, Uses, Weapon } from './schema';

export { abilities, coinIds, conditionIds, skillIds };
export type { Ability, CoinId, ConditionId, SkillId };
export type { Character, Feature, InventoryItem, Pool, SheetFile, Spell, Uses, Weapon } from './schema';

export const abilityNames: Record<Ability, string> = {
  fue: 'Fuerza',
  des: 'Destreza',
  con: 'Constitución',
  int: 'Inteligencia',
  sab: 'Sabiduría',
  car: 'Carisma',
};
export const abilityShort = (ability: Ability) => ability.toUpperCase();

export const skills: Record<SkillId, { name: string; ability: Ability; description: string }> = {
  acrobacias: { name: 'Acrobacias', ability: 'des', description: 'Mantener el equilibrio, dar volteretas o librarse de una presa con agilidad.' },
  arcanos: { name: 'Arcanos', ability: 'int', description: 'Recordar saber sobre conjuros, objetos mágicos, símbolos y planos.' },
  atletismo: { name: 'Atletismo', ability: 'fue', description: 'Trepar, saltar, nadar o forcejear con fuerza bruta.' },
  engano: { name: 'Engaño', ability: 'car', description: 'Mentir de forma convincente, disfrazar intenciones o embaucar.' },
  historia: { name: 'Historia', ability: 'int', description: 'Recordar hechos históricos, linajes, guerras y civilizaciones.' },
  interpretacion: { name: 'Interpretación', ability: 'car', description: 'Actuar, cantar, contar historias o entretener a un público.' },
  intimidacion: { name: 'Intimidación', ability: 'car', description: 'Influir mediante amenazas, hostilidad o presencia.' },
  investigacion: { name: 'Investigación', ability: 'int', description: 'Buscar pistas, deducir y examinar con detalle.' },
  juegoDeManos: { name: 'Juego de manos', ability: 'des', description: 'Robar carteras, ocultar objetos o hacer trucos manuales.' },
  medicina: { name: 'Medicina', ability: 'sab', description: 'Estabilizar a un moribundo o diagnosticar una dolencia.' },
  naturaleza: { name: 'Naturaleza', ability: 'int', description: 'Recordar saber sobre terreno, plantas, animales y clima.' },
  percepcion: { name: 'Percepción', ability: 'sab', description: 'Notar lo que te rodea: oír, ver o detectar presencias.' },
  perspicacia: { name: 'Perspicacia', ability: 'sab', description: 'Leer intenciones, detectar mentiras o predecir movimientos.' },
  persuasion: { name: 'Persuasión', ability: 'car', description: 'Convencer con tacto, buenos modales o argumentos.' },
  religion: { name: 'Religión', ability: 'int', description: 'Recordar saber sobre deidades, ritos, cultos y lo sagrado.' },
  sigilo: { name: 'Sigilo', ability: 'des', description: 'Moverse sin ser visto ni oído y ocultarse.' },
  supervivencia: { name: 'Supervivencia', ability: 'sab', description: 'Rastrear, orientarse, cazar y prever peligros naturales.' },
  tratoConAnimales: { name: 'Trato con animales', ability: 'sab', description: 'Calmar, adiestrar o intuir las intenciones de un animal.' },
};

/** Estados de 2024 (resumen propio). El agotamiento va aparte, por niveles. */
export const conditions: Record<ConditionId, { name: string; description: string }> = {
  agarrado: { name: 'Agarrado', description: 'Tu velocidad es 0. Tienes desventaja en los ataques contra cualquiera que no sea quien te agarra, y esa criatura puede arrastrarte consigo.' },
  apresado: { name: 'Apresado', description: 'Tu velocidad es 0. Los ataques contra ti tienen ventaja y los tuyos, desventaja. Tienes desventaja en las salvaciones de Destreza.' },
  asustado: { name: 'Asustado', description: 'Mientras veas el origen de tu miedo, tienes desventaja en pruebas de característica y ataques, y no puedes acercarte a él por voluntad propia.' },
  aturdido: { name: 'Aturdido', description: 'Estás incapacitado. Fallas automáticamente las salvaciones de Fuerza y Destreza, y los ataques contra ti tienen ventaja.' },
  cegado: { name: 'Cegado', description: 'No ves y fallas las pruebas que dependan de la vista. Los ataques contra ti tienen ventaja y los tuyos, desventaja.' },
  derribado: { name: 'Derribado', description: 'Solo puedes arrastrarte, o gastar la mitad de tu movimiento en levantarte. Tus ataques tienen desventaja. Los ataques contra ti tienen ventaja a 1,5 m o menos, y desventaja a más distancia.' },
  encantado: { name: 'Encantado', description: 'No puedes atacar ni dañar a quien te ha encantado, y esa criatura tiene ventaja en las pruebas para relacionarse contigo.' },
  ensordecido: { name: 'Ensordecido', description: 'No oyes y fallas las pruebas que dependan del oído.' },
  envenenado: { name: 'Envenenado', description: 'Tienes desventaja en las tiradas de ataque y en las pruebas de característica.' },
  incapacitado: { name: 'Incapacitado', description: 'No puedes hacer acciones, acciones adicionales ni reacciones, ni hablar. Pierdes la concentración y tiras la iniciativa con desventaja.' },
  inconsciente: { name: 'Inconsciente', description: 'Estás incapacitado y derribado, sueltas lo que lleves y no percibes nada. Velocidad 0. Fallas las salvaciones de Fuerza y Destreza. Los ataques contra ti tienen ventaja, y los impactos a 1,5 m o menos son críticos.' },
  invisible: { name: 'Invisible', description: 'No se te puede ver sin magia ni sentidos especiales. Tienes ventaja en la iniciativa y en tus ataques, y los ataques contra ti tienen desventaja, salvo con quien pueda verte.' },
  paralizado: { name: 'Paralizado', description: 'Estás incapacitado y tu velocidad es 0. Fallas las salvaciones de Fuerza y Destreza. Los ataques contra ti tienen ventaja, y los impactos a 1,5 m o menos son críticos.' },
  petrificado: { name: 'Petrificado', description: 'Te conviertes en piedra u otra sustancia inerte y pesas diez veces más. Estás incapacitado, con velocidad 0, y fallas las salvaciones de Fuerza y Destreza. Los ataques contra ti tienen ventaja. Resistes todo el daño y eres inmune al veneno.' },
};
export const exhaustionDescription =
  'Cada nivel resta 2 a tus pruebas d20 (pruebas de característica, ataques y salvaciones) y 1,5 m a tu velocidad. Un descanso largo quita un nivel. Con 6 niveles, mueres.';

export const coinNames: Record<CoinId, string> = {
  pc: 'Piezas de cobre',
  pp: 'Piezas de plata',
  pe: 'Piezas de electro',
  po: 'Piezas de oro',
  ppt: 'Piezas de platino',
};

// --- Reglas -----------------------------------------------------------------

/** PX necesarios para alcanzar cada nivel (índice 0 = nivel 1). */
const xpByLevel = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000,
  265000, 305000, 355000,
];

/** Espacios por nivel de conjuro para lanzadores completos (índice 0 = nivel 1). */
const fullCasterSlots = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/** Espacios por nivel de conjuro para lanzadores medios: paladín y explorador (índice 0 = nivel 1). */
const halfCasterSlots = [
  [2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3], [4, 3, 3, 1],
  [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2],
];

/** Magia de pacto del brujo: [número de espacios, nivel de los espacios] (índice 0 = nivel 1). */
const pactSlots = [
  [1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5],
  [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5],
];

type Caster = 'completo' | 'medio' | 'pacto' | null;

export interface ClassInfo {
  name: string;
  hitDie: Character['hitDice']['die'];
  /** Habilidades entre las que elige la clase a nivel 1 y cuántas. */
  skillChoices: readonly SkillId[];
  skillCount: number;
  saves: [Ability, Ability];
  spellcasting: Ability | null;
  caster: Caster;
  /** Característica que suma la Defensa sin armadura (bárbaro y monje). */
  unarmored?: Ability;
  martialWeapons: 'todas' | 'ligeras' | 'sutiles-o-ligeras' | 'ninguna';
}

/** Datos de clase indexados por el comienzo del nombre normalizado (cubre «Guerrero» y «Guerrera»). */
const classes: Record<string, ClassInfo> = {
  barbar: {
    name: 'Bárbaro', hitDie: 'd12', skillCount: 2,
    skillChoices: ['tratoConAnimales', 'atletismo', 'intimidacion', 'naturaleza', 'percepcion', 'supervivencia'],
    saves: ['fue', 'con'], spellcasting: null, caster: null, unarmored: 'con', martialWeapons: 'todas' },
  bard: {
    name: 'Bardo', hitDie: 'd8', skillCount: 3,
    skillChoices: skillIds,
    saves: ['des', 'car'], spellcasting: 'car', caster: 'completo', martialWeapons: 'ninguna' },
  bruj: {
    name: 'Brujo', hitDie: 'd8', skillCount: 2,
    skillChoices: ['arcanos', 'engano', 'historia', 'intimidacion', 'investigacion', 'naturaleza', 'religion'],
    saves: ['sab', 'car'], spellcasting: 'car', caster: 'pacto', martialWeapons: 'ninguna' },
  cleri: {
    name: 'Clérigo', hitDie: 'd8', skillCount: 2,
    skillChoices: ['historia', 'perspicacia', 'medicina', 'persuasion', 'religion'],
    saves: ['sab', 'car'], spellcasting: 'sab', caster: 'completo', martialWeapons: 'ninguna' },
  druid: {
    name: 'Druida', hitDie: 'd8', skillCount: 2,
    skillChoices: ['arcanos', 'tratoConAnimales', 'perspicacia', 'medicina', 'naturaleza', 'percepcion', 'religion', 'supervivencia'],
    saves: ['int', 'sab'], spellcasting: 'sab', caster: 'completo', martialWeapons: 'ninguna' },
  explorador: {
    name: 'Explorador', hitDie: 'd10', skillCount: 3,
    skillChoices: ['tratoConAnimales', 'atletismo', 'perspicacia', 'investigacion', 'naturaleza', 'percepcion', 'sigilo', 'supervivencia'],
    saves: ['fue', 'des'], spellcasting: 'sab', caster: 'medio', martialWeapons: 'todas' },
  guerrer: {
    name: 'Guerrero', hitDie: 'd10', skillCount: 2,
    skillChoices: ['acrobacias', 'tratoConAnimales', 'atletismo', 'historia', 'perspicacia', 'intimidacion', 'persuasion', 'percepcion', 'supervivencia'],
    saves: ['fue', 'con'], spellcasting: null, caster: null, martialWeapons: 'todas' },
  hechicer: {
    name: 'Hechicero', hitDie: 'd6', skillCount: 2,
    skillChoices: ['arcanos', 'engano', 'perspicacia', 'intimidacion', 'persuasion', 'religion'],
    saves: ['con', 'car'], spellcasting: 'car', caster: 'completo', martialWeapons: 'ninguna' },
  mag: {
    name: 'Mago', hitDie: 'd6', skillCount: 2,
    skillChoices: ['arcanos', 'historia', 'perspicacia', 'investigacion', 'medicina', 'naturaleza', 'religion'],
    saves: ['int', 'sab'], spellcasting: 'int', caster: 'completo', martialWeapons: 'ninguna' },
  monj: {
    name: 'Monje', hitDie: 'd8', skillCount: 2,
    skillChoices: ['acrobacias', 'atletismo', 'historia', 'perspicacia', 'religion', 'sigilo'],
    saves: ['fue', 'des'], spellcasting: null, caster: null, unarmored: 'sab', martialWeapons: 'ligeras' },
  paladin: {
    name: 'Paladín', hitDie: 'd10', skillCount: 2,
    skillChoices: ['atletismo', 'perspicacia', 'intimidacion', 'medicina', 'persuasion', 'religion'],
    saves: ['sab', 'car'], spellcasting: 'car', caster: 'medio', martialWeapons: 'todas' },
  picar: {
    name: 'Pícaro', hitDie: 'd8', skillCount: 4,
    skillChoices: ['acrobacias', 'atletismo', 'engano', 'perspicacia', 'intimidacion', 'investigacion', 'percepcion', 'persuasion', 'juegoDeManos', 'sigilo'],
    saves: ['des', 'int'], spellcasting: null, caster: null, martialWeapons: 'sutiles-o-ligeras' },
};

/** Clases del juego en orden alfabético, para elegir al crear un personaje. */
export const classList: readonly ClassInfo[] = Object.values(classes);

export const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export const classInfo = (className: string): ClassInfo | undefined => {
  const key = normalize(className);
  return Object.entries(classes).find(([prefix]) => key.startsWith(prefix))?.[1];
};

/**
 * Espacios máximos por nivel de conjuro (índice 0 = nivel 1) que da la clase a cierto nivel,
 * o `null` si la clase no lanza conjuros con espacios. Los niveles sin espacios valen 0.
 */
export function slotTableAt(c: Character, level: number): number[] | null {
  const caster = classInfo(c.className)?.caster;
  if (caster === 'completo') return fullCasterSlots[level - 1];
  if (caster === 'medio') return halfCasterSlots[level - 1];
  if (caster === 'pacto') {
    const [count, slotLevel] = pactSlots[level - 1];
    return Array.from({ length: slotLevel }, (_, i) => (i === slotLevel - 1 ? count : 0));
  }
  return null;
}
/** Los espacios de la magia de pacto se recuperan también en un descanso corto. */
export const hasPactMagic = (c: Character) => classInfo(c.className)?.caster === 'pacto';

export const modifier = (score: number) => Math.floor((score - 10) / 2);
export const proficiencyBonus = (level: number) => Math.ceil(level / 4) + 1;
export const xpForNextLevel = (level: number): number | null => xpByLevel[level] ?? null;
/** Media fija de PG por nivel según el dado de golpe (d6 → 4, d8 → 5…). */
export const hitDieAverage = (die: Character['hitDice']['die']) => Number(die.slice(1)) / 2 + 1;
export const abilityMod = (c: Character, ability: Ability) => modifier(c.abilities[ability]);
export const initiative = (c: Character) => abilityMod(c, 'des');
export const saveBonus = (c: Character, ability: Ability) =>
  abilityMod(c, ability) + (c.savingThrows.includes(ability) ? proficiencyBonus(c.level) : 0);
export const skillLevel = (c: Character, skill: SkillId) => c.skills[skill] ?? 0;
export const skillBonus = (c: Character, skill: SkillId) =>
  abilityMod(c, skills[skill].ability) + skillLevel(c, skill) * proficiencyBonus(c.level);
export const passivePerception = (c: Character) => 10 + skillBonus(c, 'percepcion');
/**
 * CA y su desglose: armadura equipada (o 10 + Des y la Defensa sin armadura de la clase),
 * escudo y otros bonificadores. La armadura intermedia limita la Des a +2 y la pesada la ignora.
 */
export function armorClassBreakdown(c: Character): { total: number; parts: string[] } {
  const body = c.inventory.find((item) => item.equipped && item.armor && item.armor.kind !== 'escudo');
  const shield = c.inventory.find((item) => item.equipped && item.armor?.kind === 'escudo');
  const dex = abilityMod(c, 'des');
  const parts: string[] = [];
  let total: number;
  if (body?.armor) {
    const dexPart = body.armor.kind === 'pesada' ? 0 : body.armor.kind === 'intermedia' ? Math.min(dex, 2) : dex;
    total = body.armor.base + dexPart;
    parts.push(`${body.name} ${body.armor.base}`);
    if (body.armor.kind !== 'pesada') parts.push(`DES ${signed(dexPart)}${body.armor.kind === 'intermedia' && dex > 2 ? ' (máx. +2)' : ''}`);
  } else {
    total = 10 + dex;
    parts.push('sin armadura 10', `DES ${signed(dex)}`);
    const extra = classInfo(c.className)?.unarmored;
    // El monje pierde su Defensa sin armadura si lleva escudo.
    if (extra && !(extra === 'sab' && shield)) {
      total += abilityMod(c, extra);
      parts.push(`${extra.toUpperCase()} ${signed(abilityMod(c, extra))}`);
    }
  }
  if (shield?.armor) {
    total += shield.armor.base;
    parts.push(`${shield.name} ${signed(shield.armor.base)}`);
  }
  if (c.acBonus) {
    total += c.acBonus;
    parts.push(`otros ${signed(c.acBonus)}`);
  }
  return { total, parts };
}
export const armorClass = (c: Character) => armorClassBreakdown(c).total;

/** En 2024, 50 monedas pesan 1 libra; aquí, como el resto del equipo, 1 libra = 0,5 kg. */
export const coinWeight = (c: Character) => coinIds.reduce((total, coin) => total + c.coins[coin], 0) / 100;
export const carriedWeight = (c: Character) =>
  c.inventory.reduce((total, item) => total + item.weightKg * item.quantity, 0) +
  c.weapons.reduce((total, weapon) => total + weapon.weightKg, 0) +
  coinWeight(c);

export const hasProperty = (weapon: Weapon, property: string) =>
  weapon.properties.some((p) => normalize(p).startsWith(normalize(property)));

/** Característica del arma: Destreza a distancia, Fuerza cuerpo a cuerpo, la mejor si es Sutil. */
export function weaponAbility(c: Character, weapon: Weapon): Ability {
  if (hasProperty(weapon, 'sutil')) return abilityMod(c, 'des') > abilityMod(c, 'fue') ? 'des' : 'fue';
  return weapon.ranged ? 'des' : 'fue';
}
export const weaponAttack = (c: Character, weapon: Weapon) =>
  abilityMod(c, weaponAbility(c, weapon)) + (weapon.proficient ? proficiencyBonus(c.level) : 0) + weapon.magicBonus;
export const weaponDamageBonus = (c: Character, weapon: Weapon) => abilityMod(c, weaponAbility(c, weapon)) + weapon.magicBonus;
export const damageText = (dice: string, bonus: number, type: string) =>
  [`${dice}${bonus ? ` ${signed(bonus)}` : ''}`, type].filter(Boolean).join(' ');

/** Competencia por defecto al añadir un arma, según la clase. */
export function defaultWeaponProficiency(c: Character, weapon: Weapon) {
  if (weapon.category === 'sencilla') return true;
  switch (classInfo(c.className)?.martialWeapons) {
    case 'todas': return true;
    case 'ligeras': return hasProperty(weapon, 'ligera');
    case 'sutiles-o-ligeras': return hasProperty(weapon, 'sutil') || hasProperty(weapon, 'ligera');
    default: return false;
  }
}

export const spellcastingMod = (c: Character) => (c.spellcastingAbility ? abilityMod(c, c.spellcastingAbility) : 0);
export const spellSaveDC = (c: Character) => 8 + proficiencyBonus(c.level) + spellcastingMod(c);
export const spellAttackBonus = (c: Character) => proficiencyBonus(c.level) + spellcastingMod(c);

/** Dados del efecto de un conjuro; los trucos multiplican sus dados a nivel 5, 11 y 17. */
export function spellDice(c: Character, spell: Spell): string {
  const dice = spell.effect?.dice ?? '';
  const match = /^(\d+)d(\d+)(.*)$/.exec(dice);
  if (spell.level !== 0 || !match) return dice;
  const tier = c.level >= 17 ? 4 : c.level >= 11 ? 3 : c.level >= 5 ? 2 : 1;
  return `${Number(match[1]) * tier}d${match[2]}${match[3]}`;
}
export const spellEffectText = (c: Character, spell: Spell) =>
  spell.effect ? damageText(spellDice(c, spell), spell.effect.addModifier ? spellcastingMod(c) : 0, spell.effect.type) : '';

/** Tira una expresión «2d6», «1d4+1» o «3». Devuelve `null` si no se entiende. */
export function rollExpression(expression: string, random = Math.random): { rolls: number[]; total: number } | null {
  const match = /^\s*(\d+)(?:d(\d+))?\s*(?:([+-])\s*(\d+))?\s*$/.exec(expression);
  if (!match) return null;
  const [, count, sides, sign, extra] = match;
  const rolls = sides ? Array.from({ length: Number(count) }, () => Math.floor(random() * Number(sides)) + 1) : [Number(count)];
  const total = rolls.reduce((a, b) => a + b, 0) + (sign ? Number(`${sign}${extra}`) : 0);
  return { rolls, total };
}

// --- En partida: PG temporales, salvaciones contra la muerte, concentración y agotamiento ---
// Las funciones que cambian la ficha la modifican en el sitio; el cliente las llama dentro de `update`.

/** Lo que resta el agotamiento a cada prueba d20. */
export const exhaustionPenalty = (c: Character) => 2 * c.exhaustion;
/** Metros que resta el agotamiento a la velocidad. */
export const exhaustionSpeed = (c: Character) => 1.5 * c.exhaustion;

export const noDeathSaves = (): Character['deathSaves'] => ({ successes: 0, failures: 0, stable: false });

/** CD de la salvación de Constitución para mantener la concentración: la mitad del daño, entre 10 y 30. */
export const concentrationDC = (damage: number) => Math.min(30, Math.max(10, Math.floor(damage / 2)));

/**
 * Recibe daño: primero se gastan los PG temporales. A 0 PG, el daño que pase de los temporales
 * es un fallo de salvación contra la muerte y quita la estabilidad. Caer a 0 PG deja inconsciente
 * y termina la concentración. Devuelve la CD de concentración si sigue concentrándose.
 */
export function takeDamage(c: Character, amount: number): number | null {
  if (amount <= 0) return null;
  const absorbed = Math.min(c.hp.temp, amount);
  const rest = amount - absorbed;
  c.hp.temp -= absorbed;
  if (c.hp.current === 0) {
    if (rest > 0) c.deathSaves = { ...c.deathSaves, failures: Math.min(3, c.deathSaves.failures + 1), stable: false };
  } else {
    c.hp.current = Math.max(0, c.hp.current - rest);
  }
  if (c.hp.current === 0) c.concentration = null;
  return c.concentration ? concentrationDC(amount) : null;
}

/** Cura sin pasar del máximo; no suma PG temporales. Volver a tener PG reinicia las salvaciones contra la muerte. */
export function heal(c: Character, amount: number) {
  c.hp.current = Math.min(c.hp.max, c.hp.current + Math.max(0, amount));
  if (c.hp.current > 0) c.deathSaves = noDeathSaves();
}

/** Los PG temporales no se acumulan: se queda el valor mayor. */
export function gainTempHp(c: Character, amount: number) {
  c.hp.temp = Math.max(c.hp.temp, amount);
}

export type DeathSaveOutcome = 'recupera' | 'exito' | 'estable' | 'fallo' | 'muerte';

/**
 * Aplica una salvación contra la muerte con el dado `die` (d20), al que se resta el agotamiento.
 * Un 20 natural recupera 1 PG; un 1 natural son dos fallos; 10 o más es un éxito. Tres éxitos
 * estabilizan y reinician las casillas; tres fallos, muerte.
 */
export function deathSave(c: Character, die: number): DeathSaveOutcome {
  const saves = c.deathSaves;
  if (die === 20) {
    heal(c, 1);
    return 'recupera';
  }
  if (die !== 1 && die - exhaustionPenalty(c) >= 10) {
    if (saves.successes + 1 >= 3) {
      c.deathSaves = { ...noDeathSaves(), stable: true };
      return 'estable';
    }
    saves.successes += 1;
    return 'exito';
  }
  saves.failures = Math.min(3, saves.failures + (die === 1 ? 2 : 1));
  return saves.failures === 3 ? 'muerte' : 'fallo';
}

/** Estado de las salvaciones contra la muerte en palabras, o cadena vacía si no hay nada que contar. */
export function deathSaveState(c: Character): string {
  if (c.hp.current > 0) return '';
  if (c.deathSaves.failures >= 3) return 'Ha muerto';
  if (c.deathSaves.stable) return 'Estabilizado';
  return 'Inconsciente';
}

// --- Formato ----------------------------------------------------------------

export const signed = (n: number) => (n < 0 ? `−${-n}` : `+${n}`);
const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: 'always', maximumFractionDigits: 2 });
export const formatNumber = (n: number) => numberFormat.format(n);
const dateFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
const timeFormat = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));
export const pips = ({ current, max }: Pool) => '●'.repeat(Math.min(current, max)) + '○'.repeat(Math.max(0, max - current));
export const percent = ({ current, max }: Pool) => `${max ? Math.min(100, (current / max) * 100) : 0}%`;
export const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '').join('');
export const classLine = (c: Character) => [c.species, `${c.className} ${c.subclass.toLowerCase()}`.trim()].filter(Boolean).join(' · ');
export const recoveryText = (uses: Uses) =>
  uses.recovery === 'ninguna' ? 'No se recupera' : `Descanso ${uses.recovery}`;
/** Nombre de cada nivel de competencia (0, 1 o 2); las marcas ○ ● ◆ se dibujan con CSS según `data-level`. */
export const proficiencyLabels = ['Sin competencia', 'Competente', 'Pericia'];
export const saveLevel = (c: Character, ability: Ability) => Number(c.savingThrows.includes(ability));
export const spellLevelText = (level: number) => (level === 0 ? 'Truco' : `Nivel ${level}`);

// --- Filas de listas --------------------------------------------------------

/** Fila genérica de lista; es lo que pinta `EntryRow.astro` y su plantilla en cliente. */
export interface Row {
  title: string;
  detail: string;
  tag: string;
}

export const spellRow = (c: Character, spell: Spell): Row => ({
  title: spell.name,
  detail: [spellLevelText(spell.level), spell.casting, spell.concentration && 'Concentración', spell.ritual && 'Ritual', spellEffectText(c, spell)]
    .filter(Boolean)
    .join(' · '),
  tag: spell.school,
});
export const weaponRow = (c: Character, weapon: Weapon): Row => ({
  title: weapon.magicBonus ? `${weapon.name} ${signed(weapon.magicBonus)}` : weapon.name,
  detail: `Ataque ${signed(weaponAttack(c, weapon))} · ${damageText(weapon.damage, weaponDamageBonus(c, weapon), weapon.damageType)}`,
  tag: weapon.mastery,
});
export const itemRow = (item: InventoryItem): Row => ({
  title: item.name,
  detail: [item.equipped && 'Equipado', item.kind, `${formatNumber(item.weightKg * item.quantity)} kg`, item.uses && `${item.uses.current}/${item.uses.max} usos`]
    .filter(Boolean)
    .join(' · '),
  tag: item.quantity === 1 ? '' : `× ${item.quantity}`,
});
export const featureRow = (feature: Feature): Row => ({
  title: feature.name,
  detail: feature.description,
  tag: feature.uses ? `${feature.uses.current} / ${feature.uses.max}` : '',
});
export const historyRow = (entry: Character['history'][number]): Row => ({
  title: entry.title,
  detail: entry.detail,
  tag: formatDate(entry.date),
});

/** Fila de un recurso gastable. `key` identifica qué contador modifica: `slot:3`, `features:0` o `inventory:2`. */
export interface ResourceRow {
  key: string;
  title: string;
  detail: string;
  pool: Pool;
}

export const slotRows = (c: Character): ResourceRow[] =>
  Object.entries(c.spellSlots)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([level, slots]) => ({
      key: `slot:${level}`,
      title: `Espacios de nivel ${level}`,
      detail: hasPactMagic(c) ? 'Descanso corto' : 'Descanso largo',
      pool: slots,
    }));

export const resourceRows = (c: Character): ResourceRow[] => [
  ...slotRows(c),
  ...c.features.flatMap((f, i) => (f.uses ? [{ key: `features:${i}`, title: f.name, detail: recoveryText(f.uses), pool: f.uses }] : [])),
  ...c.inventory.flatMap((item, i) => (item.uses ? [{ key: `inventory:${i}`, title: item.name, detail: recoveryText(item.uses), pool: item.uses }] : [])),
];

/**
 * Textos derivados, indexados por la clave de `data-bind` en el marcado. El servidor
 * los pinta al renderizar y el cliente los reescribe tras cada cambio.
 */
export function liveText(c: Character): Record<string, string> {
  const next = xpForNextLevel(c.level);
  const text: Record<string, string> = {
    eyebrow: `Nivel ${c.level} · competencia ${signed(proficiencyBonus(c.level))}`,
    nextLevel: String(Math.min(20, c.level + 1)),
    xpNext: next === null ? 'nivel máximo' : `/ ${formatNumber(next)} PX`,
    initiative: signed(initiative(c)),
    armorClass: String(armorClass(c)),
    passivePerception: String(passivePerception(c)),
    spellCount: `${c.spells.length} conjuros`,
    weight: `Carga · ${formatNumber(carriedWeight(c))} kg${coinWeight(c) ? ` (monedas ${formatNumber(coinWeight(c))} kg)` : ''}`,
    spellDC: c.spellcastingAbility ? String(spellSaveDC(c)) : '—',
    spellAttack: c.spellcastingAbility ? signed(spellAttackBonus(c)) : '—',
    speedNote: speedNote(c),
    exhaustionNote: c.exhaustion ? `−${exhaustionPenalty(c)} a pruebas d20 · −${formatNumber(exhaustionSpeed(c))} m${c.exhaustion === 6 ? ' · muerte' : ''}` : 'sin agotamiento',
    deathState: deathSaveState(c),
  };
  for (const ability of abilities) {
    text[`mod-${ability}`] = signed(abilityMod(c, ability));
    text[`save-${ability}`] = signed(saveBonus(c, ability));
  }
  for (const skill of skillIds) {
    text[`skill-${skill}`] = signed(skillBonus(c, skill));
  }
  return text;
}

/** Velocidad con el agotamiento aplicado; si la velocidad no empieza por «N m», solo lo que resta. */
function speedNote(c: Character): string {
  if (!c.exhaustion) return '';
  const meters = /^\s*(\d+(?:[.,]\d+)?)\s*m\b/.exec(c.speed)?.[1];
  const lost = exhaustionSpeed(c);
  return meters === undefined
    ? `−${formatNumber(lost)} m por agotamiento`
    : `${formatNumber(Math.max(0, Number(meters.replace(',', '.')) - lost))} m con agotamiento`;
}

/** Anchuras de las barras de progreso, indexadas por la clave de `data-bar`. */
export function liveBars(c: Character): Record<string, string> {
  const next = xpForNextLevel(c.level);
  return {
    hp: percent(c.hp),
    // Los PG temporales se pintan a continuación de los actuales, dentro de la misma barra.
    hpTemp: percent({ current: c.hp.temp, max: c.hp.max }),
    hitDice: percent(c.hitDice),
    xp: next === null ? '100%' : percent({ current: c.xp, max: next }),
  };
}
