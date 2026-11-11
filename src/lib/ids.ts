// Constantes del sistema. Módulo sin dependencias para usarlo en servidor y cliente.

/** Versión del formato de archivo; súbela al cambiar el esquema y añade su paso en `migrate.ts`. */
export const currentSchemaVersion = 5;

export const abilities = ['fue', 'des', 'con', 'int', 'sab', 'car'] as const;

/**
 * Descanso que recupera los usos de un rasgo u objeto. `uno-corto`: uno en descanso corto y
 * todos en descanso largo (Furia, Canalizar divinidad, Forma salvaje, Tomar aliento…).
 */
export const recoveryIds = ['corto', 'uno-corto', 'largo', 'ninguna'] as const;

export const skillIds = [
  'acrobacias', 'arcanos', 'atletismo', 'engano', 'historia', 'interpretacion', 'intimidacion', 'investigacion',
  'juegoDeManos', 'medicina', 'naturaleza', 'percepcion', 'perspicacia', 'persuasion', 'religion', 'sigilo',
  'supervivencia', 'tratoConAnimales',
] as const;

/** Estados de 2024, salvo el agotamiento, que va por niveles en su propio campo. */
export const conditionIds = [
  'agarrado', 'apresado', 'asustado', 'aturdido', 'cegado', 'derribado', 'encantado', 'ensordecido', 'envenenado',
  'incapacitado', 'inconsciente', 'invisible', 'paralizado', 'petrificado',
] as const;

/** Monedas de 2024, de menor a mayor valor: cobre, plata, electro, oro y platino. */
export const coinIds = ['pc', 'pp', 'pe', 'po', 'ppt'] as const;

export type Ability = (typeof abilities)[number];
export type SkillId = (typeof skillIds)[number];
export type ConditionId = (typeof conditionIds)[number];
export type CoinId = (typeof coinIds)[number];
export type Recovery = (typeof recoveryIds)[number];
