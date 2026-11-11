// Reglas D&D 2024 y valores derivados de una ficha. Lo comparten el render en servidor
// y el script de cliente, para que ambos muestren exactamente lo mismo.
import { abilities, skillIds, type Ability, type SkillId } from './ids';
import type { Character, Feature, InventoryItem, Pool, Spell, Uses, Weapon } from './schema';

export { abilities, skillIds };
export type { Ability, SkillId };
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

interface ClassInfo {
  saves: [Ability, Ability];
  spellcasting: Ability | null;
  caster: Caster;
  /** Característica que suma la Defensa sin armadura (bárbaro y monje). */
  unarmored?: Ability;
  martialWeapons: 'todas' | 'ligeras' | 'sutiles-o-ligeras' | 'ninguna';
}

/** Datos de clase indexados por el comienzo del nombre normalizado (cubre «Guerrero» y «Guerrera»). */
const classes: Record<string, ClassInfo> = {
  barbar: { saves: ['fue', 'con'], spellcasting: null, caster: null, unarmored: 'con', martialWeapons: 'todas' },
  bard: { saves: ['des', 'car'], spellcasting: 'car', caster: 'completo', martialWeapons: 'ninguna' },
  bruj: { saves: ['sab', 'car'], spellcasting: 'car', caster: 'pacto', martialWeapons: 'ninguna' },
  cleri: { saves: ['sab', 'car'], spellcasting: 'sab', caster: 'completo', martialWeapons: 'ninguna' },
  druid: { saves: ['int', 'sab'], spellcasting: 'sab', caster: 'completo', martialWeapons: 'ninguna' },
  explorador: { saves: ['fue', 'des'], spellcasting: 'sab', caster: 'medio', martialWeapons: 'todas' },
  guerrer: { saves: ['fue', 'con'], spellcasting: null, caster: null, martialWeapons: 'todas' },
  hechicer: { saves: ['con', 'car'], spellcasting: 'car', caster: 'completo', martialWeapons: 'ninguna' },
  mag: { saves: ['int', 'sab'], spellcasting: 'int', caster: 'completo', martialWeapons: 'ninguna' },
  monj: { saves: ['fue', 'des'], spellcasting: null, caster: null, unarmored: 'sab', martialWeapons: 'ligeras' },
  paladin: { saves: ['sab', 'car'], spellcasting: 'car', caster: 'medio', martialWeapons: 'todas' },
  picar: { saves: ['des', 'int'], spellcasting: null, caster: null, martialWeapons: 'sutiles-o-ligeras' },
};

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

export const carriedWeight = (c: Character) =>
  c.inventory.reduce((total, item) => total + item.weightKg * item.quantity, 0) +
  c.weapons.reduce((total, weapon) => total + weapon.weightKg, 0);

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

// --- Formato ----------------------------------------------------------------

export const signed = (n: number) => (n < 0 ? `−${-n}` : `+${n}`);
const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: 'always', maximumFractionDigits: 2 });
export const formatNumber = (n: number) => numberFormat.format(n);
const dateFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const pips = ({ current, max }: Pool) => '●'.repeat(Math.min(current, max)) + '○'.repeat(Math.max(0, max - current));
export const percent = ({ current, max }: Pool) => `${max ? Math.min(100, (current / max) * 100) : 0}%`;
export const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '').join('');
export const classLine = (c: Character) => [c.species, `${c.className} ${c.subclass.toLowerCase()}`.trim()].filter(Boolean).join(' · ');
export const recoveryText = (uses: Uses) =>
  uses.recovery === 'ninguna' ? 'No se recupera' : `Descanso ${uses.recovery}`;
export const proficiencyMark = (level: number) => ['○', '●', '◆'][level] ?? '○';
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
    weight: `Carga · ${formatNumber(carriedWeight(c))} kg`,
    spellDC: c.spellcastingAbility ? String(spellSaveDC(c)) : '—',
    spellAttack: c.spellcastingAbility ? signed(spellAttackBonus(c)) : '—',
  };
  for (const ability of abilities) {
    text[`mod-${ability}`] = signed(abilityMod(c, ability));
    text[`save-${ability}`] = signed(saveBonus(c, ability));
    text[`saveMark-${ability}`] = proficiencyMark(c.savingThrows.includes(ability) ? 1 : 0);
  }
  for (const skill of skillIds) {
    text[`skill-${skill}`] = signed(skillBonus(c, skill));
    text[`skillMark-${skill}`] = proficiencyMark(skillLevel(c, skill));
  }
  return text;
}

/** Anchuras de las barras de progreso, indexadas por la clave de `data-bar`. */
export function liveBars(c: Character): Record<string, string> {
  const next = xpForNextLevel(c.level);
  return {
    hp: percent(c.hp),
    hitDice: percent(c.hitDice),
    xp: next === null ? '100%' : percent({ current: c.xp, max: next }),
  };
}
