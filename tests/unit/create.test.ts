import { describe, expect, it } from 'vitest';
import { buildCharacter, findClass, pointBuyCost, type CreationChoices } from '../../src/lib/create';
import { currentSchemaVersion, sheetFileSchema } from '../../src/lib/schema';
import { armorClass, skillBonus } from '../../src/lib/sheet';

describe('pointBuyCost', () => {
  it('suma el coste de cada puntuación', () => {
    expect(pointBuyCost([8, 8, 8, 8, 8, 8])).toBe(0);
    expect(pointBuyCost([15, 15, 14, 8, 8, 8])).toBe(25);
    expect(pointBuyCost([15, 15, 15, 8, 8, 8])).toBe(27);
    expect(pointBuyCost([13, 13, 13, 12, 12, 12])).toBe(27);
  });

  it('devuelve null fuera de 8–15', () => {
    expect(pointBuyCost([16, 8, 8, 8, 8, 8])).toBeNull();
    expect(pointBuyCost([7, 8, 8, 8, 8, 8])).toBeNull();
  });
});

describe('buildCharacter', () => {
  const choices = (className: string, overrides: Partial<CreationChoices> = {}): CreationChoices => ({
    name: 'Pruebas Valientes',
    species: 'Humano',
    classInfo: findClass(className)!,
    background: 'Soldado',
    alignment: '',
    baseScores: { fue: 15, des: 14, con: 13, int: 8, sab: 12, car: 10 },
    backgroundBonus: { fue: 2, con: 1 },
    skills: ['atletismo', 'percepcion'],
    method: 'Matriz estándar',
    ...overrides,
  });

  it('guerrero: puntuaciones con trasfondo, PG, salvaciones, habilidades y rasgos de nivel 1', () => {
    const c = buildCharacter(choices('Guerrero'));
    expect(c.abilities).toEqual({ fue: 17, des: 14, con: 14, int: 8, sab: 12, car: 10 });
    expect(c.hp).toEqual({ current: 12, max: 12, temp: 0 });
    expect(c.hitDice).toEqual({ current: 1, max: 1, die: 'd10' });
    expect(c.savingThrows).toEqual(['fue', 'con']);
    expect(skillBonus(c, 'atletismo')).toBe(5);
    expect(c.features.map((f) => f.name)).toContain('Tomar aliento');
    expect(c.spellcastingAbility).toBeNull();
    expect(c.spellSlots).toEqual({});
    expect(armorClass(c)).toBe(12);
    expect(c.history).toHaveLength(1);
    expect(() => sheetFileSchema.parse({ schemaVersion: currentSchemaVersion, version: 0, character: c })).not.toThrow();
  });

  it('mago: espacios de nivel 1 y aptitud mágica', () => {
    const c = buildCharacter(choices('Mago', { baseScores: { fue: 8, des: 14, con: 13, int: 15, sab: 12, car: 10 }, backgroundBonus: { int: 1, con: 1, des: 1 } }));
    expect(c.spellcastingAbility).toBe('int');
    expect(c.spellSlots).toEqual({ 1: { current: 2, max: 2 } });
    expect(c.hp.max).toBe(8); // d6 + CON +2
    expect(c.features.map((f) => f.name)).toContain('Recuperación arcana');
  });

  it('las puntuaciones no pasan de 20 y los PG no bajan de 1', () => {
    const c = buildCharacter(choices('Mago', { baseScores: { fue: 19, des: 8, con: 3, int: 8, sab: 8, car: 8 }, backgroundBonus: { fue: 2, con: 1 } }));
    expect(c.abilities.fue).toBe(20);
    expect(c.hp.max).toBe(3); // d6 + CON −3
    const fragile = buildCharacter(choices('Mago', { baseScores: { fue: 8, des: 8, con: 1, int: 8, sab: 8, car: 8 }, backgroundBonus: {} }));
    expect(fragile.hp.max).toBe(1);
  });
});
