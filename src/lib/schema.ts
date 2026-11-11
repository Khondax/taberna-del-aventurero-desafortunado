// Esquema del archivo de ficha. Solo lo usa el servidor (validación al leer, guardar e
// importar); el cliente importa únicamente los tipos para no cargar Zod en el navegador.
// Los archivos de versiones anteriores se convierten en `migrate.ts` antes de validar.
import { z } from 'astro/zod';
import { abilities, conditionIds, currentSchemaVersion, recoveryIds, skillIds } from './ids';

// Mensajes de validación en español (se muestran al importar un archivo inválido).
z.config(z.locales.es());

const count = z.number().int().min(0);
const text = z.string().trim();
const name = text.min(1);
const ability = z.enum(abilities);
const score = z.number().int().min(1).max(30);
const pool = z.object({ current: count, max: count });

/** Usos de un rasgo u objeto y el descanso que los recupera. */
const usesSchema = pool.extend({ recovery: z.enum(recoveryIds) });

const featureSchema = z.object({
  name,
  source: text,
  description: text,
  uses: usesSchema.nullable(),
});

const spellSchema = z.object({
  name,
  level: z.number().int().min(0).max(9),
  school: text,
  casting: text,
  range: text,
  components: text,
  duration: text,
  concentration: z.boolean(),
  ritual: z.boolean(),
  description: text,
  /** Daño o curación. `addModifier` suma el modificador de la aptitud mágica. */
  effect: z.object({ dice: text, type: text, addModifier: z.boolean() }).nullable(),
  /** Característica con la que salva el objetivo, si la hay. */
  save: ability.nullable(),
  attack: z.boolean(),
  higherLevels: text,
});

const weaponSchema = z.object({
  name,
  category: z.enum(['sencilla', 'marcial']),
  ranged: z.boolean(),
  damage: text.regex(/^\d+(d\d+)?$/, 'Usa el formato 1d8 o un número'),
  damageType: text,
  versatile: text.regex(/^(\d+d\d+)?$/, 'Usa el formato 1d10 o déjalo vacío'),
  /** Propiedades tal como se muestran: «Sutil», «Arrojadiza (6/18 m)»… */
  properties: z.array(text),
  range: text,
  mastery: text,
  proficient: z.boolean(),
  magicBonus: z.number().int().min(-5).max(5),
  weightKg: z.number().min(0),
  description: text,
});

const itemSchema = z.object({
  name,
  kind: text,
  quantity: count,
  weightKg: z.number().min(0),
  description: text,
  uses: usesSchema.nullable(),
  equipped: z.boolean(),
  /** Si es armadura o escudo: tipo y CA base (para el escudo, su bonificador). */
  armor: z.object({ kind: z.enum(['ligera', 'intermedia', 'pesada', 'escudo']), base: z.number().int().min(0).max(30) }).nullable(),
});

const characterSchema = z.object({
  name,
  species: text,
  className: text,
  subclass: text,
  background: text,
  alignment: text,
  level: z.number().int().min(1).max(20),
  xp: count,
  abilities: z.object({ fue: score, des: score, con: score, int: score, sab: score, car: score }),
  /** Bonificadores a la CA que no vienen de la armadura (Armadura de mago, objetos, estilos…). */
  acBonus: z.number().int().min(-10).max(20),
  speed: text,
  /** `temp`: PG temporales. El daño los gasta primero y no se acumulan (se queda el mayor). */
  hp: pool.extend({ temp: count }),
  hitDice: pool.extend({ die: z.enum(['d6', 'd8', 'd10', 'd12']) }),
  /** Salvaciones contra la muerte a 0 PG. `stable`: tres éxitos, ya no tira. */
  deathSaves: z.object({ successes: z.number().int().min(0).max(3), failures: z.number().int().min(0).max(3), stable: z.boolean() }),
  /** Nombre del conjuro en el que se concentra, o `null`. */
  concentration: name.nullable(),
  conditions: z.array(z.enum(conditionIds)),
  /** Niveles de agotamiento (0 a 6). */
  exhaustion: z.number().int().min(0).max(6),
  savingThrows: z.array(ability),
  /** Competencia en habilidades: 1 = competente, 2 = pericia. Las que faltan valen 0. */
  skills: z.partialRecord(z.enum(skillIds), z.union([z.literal(0), z.literal(1), z.literal(2)])),
  spellcastingAbility: ability.nullable(),
  /** Espacios de conjuro indexados por nivel de conjuro ("1" a "9"). */
  spellSlots: z.record(z.string().regex(/^[1-9]$/), pool),
  features: z.array(featureSchema),
  spells: z.array(spellSchema),
  weapons: z.array(weaponSchema),
  inventory: z.array(itemSchema),
  /** Monedas: cobre, plata, electro, oro y platino. Cuentan para la carga (50 monedas = 0,5 kg). */
  coins: z.object({ pc: count, pp: count, pe: count, po: count, ppt: count }),
  history: z.array(z.object({ date: z.iso.datetime(), title: text, detail: text })),
  notes: z.string(),
});

export { currentSchemaVersion };

/** Archivo de ficha tal como se guarda en disco y se exporta. */
export const sheetFileSchema = z.object({
  schemaVersion: z.literal(currentSchemaVersion),
  /** Contador de guardados para detectar escrituras desde una copia desactualizada. */
  version: count,
  character: characterSchema,
});

/** Lo que se acepta al importar: un archivo exportado, sin importar su `version`. */
export const importSchema = sheetFileSchema.omit({ version: true });

/**
 * Tirada del historial compartido (`.tiradas.json` en `DATA_DIR`), fuera de la ficha para
 * no cambiar su versión con cada tirada.
 */
export const rollEntrySchema = z.object({
  date: z.iso.datetime(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: name.max(120),
  /** Qué se tiró, con el desglose: «Sigilo · d20 [14] +5». */
  label: text.max(400),
  result: text.max(80),
});

export type { Ability, CoinId, ConditionId, SkillId } from './ids';
export type Character = z.infer<typeof characterSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Spell = z.infer<typeof spellSchema>;
export type Weapon = z.infer<typeof weaponSchema>;
export type InventoryItem = z.infer<typeof itemSchema>;
export type Uses = z.infer<typeof usesSchema>;
export type Armor = NonNullable<InventoryItem['armor']>;
export type SheetFile = z.infer<typeof sheetFileSchema>;
export type Pool = z.infer<typeof pool>;
export type RollEntry = z.infer<typeof rollEntrySchema>;
