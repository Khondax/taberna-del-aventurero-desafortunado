// Constantes del sistema. Módulo sin dependencias para usarlo en servidor y cliente.

/** Versión del formato de archivo; súbela al cambiar el esquema y añade su paso en `migrate.ts`. */
export const currentSchemaVersion = 2;

export const abilities = ['fue', 'des', 'con', 'int', 'sab', 'car'] as const;

export const skillIds = [
  'acrobacias', 'arcanos', 'atletismo', 'engano', 'historia', 'interpretacion', 'intimidacion', 'investigacion',
  'juegoDeManos', 'medicina', 'naturaleza', 'percepcion', 'perspicacia', 'persuasion', 'religion', 'sigilo',
  'supervivencia', 'tratoConAnimales',
] as const;

export type Ability = (typeof abilities)[number];
export type SkillId = (typeof skillIds)[number];
