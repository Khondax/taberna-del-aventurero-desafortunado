import { describe, expect, it } from 'vitest';
import { backgroundCatalog, findBackground, findSpecies, speciesCatalog } from '../../src/data/origins';
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
    species: 'Casera',
    classInfo: findClass(className)!,
    background: 'Casero',
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

describe('trasfondos y especies del listado', () => {
  const choices = (overrides: Partial<CreationChoices>): CreationChoices => ({
    name: 'Pruebas Orígenes', species: '', classInfo: findClass('Mago')!, background: '', alignment: '',
    baseScores: { fue: 8, des: 14, con: 13, int: 15, sab: 12, car: 10 }, backgroundBonus: { int: 2, sab: 1 },
    skills: ['investigacion', 'medicina'], method: 'Matriz estándar', ...overrides,
  });

  it('los cuatro trasfondos del SRD 5.2: tres características, dos habilidades y una dote de origen', () => {
    expect(backgroundCatalog.map((b) => [b.name, b.abilities, b.skills, b.feat.name])).toEqual([
      ['Acólito', ['int', 'sab', 'car'], ['perspicacia', 'religion'], 'Iniciado en la magia (clérigo)'],
      ['Criminal', ['des', 'con', 'int'], ['juegoDeManos', 'sigilo'], 'Alerta'],
      ['Sabio', ['con', 'int', 'sab'], ['arcanos', 'historia'], 'Iniciado en la magia (mago)'],
      ['Soldado', ['fue', 'des', 'con'], ['atletismo', 'intimidacion'], 'Atacante salvaje'],
    ]);
  });

  it('las nueve especies del SRD 5.2 con tamaño, velocidad y rasgos', () => {
    expect(speciesCatalog.map((s) => [s.name, s.size, s.speed])).toEqual([
      ['Dracónido', 'Mediano', '9 m'], ['Elfo', 'Mediano', '9 m'], ['Enano', 'Mediano', '9 m'], ['Gnomo', 'Pequeño', '9 m'],
      ['Goliat', 'Mediano', '10,5 m'], ['Humano', 'Mediano o Pequeño', '9 m'], ['Mediano', 'Pequeño', '9 m'], ['Orco', 'Mediano', '9 m'],
      ['Tiflin', 'Mediano o Pequeño', '9 m'],
    ]);
    for (const species of speciesCatalog) {
      expect(species.traits.length, species.name).toBeGreaterThanOrEqual(3);
      for (const trait of species.traits) expect(trait.source).toBe(species.name);
    }
  });

  it('se encuentran sin tildes, mayúsculas ni género', () => {
    expect(findBackground('acolita')?.name).toBe('Acólito');
    expect(findSpecies(' ENANA ')?.name).toBe('Enano');
    expect(findSpecies('Elfo marino')).toBeUndefined();
  });

  it('sabio: añade sus habilidades a las elegidas y su dote de origen', () => {
    const c = buildCharacter(choices({ background: 'Sabio' }));
    expect(c.background).toBe('Sabio');
    expect(c.skills).toEqual({ arcanos: 1, historia: 1, investigacion: 1, medicina: 1 });
    const feat = c.features.find((f) => f.name === 'Iniciado en la magia (mago)');
    expect(feat).toMatchObject({ source: 'Dote de origen · Sabio', uses: { current: 1, max: 1, recovery: 'largo' } });
  });

  it('goliat: velocidad y rasgos de la especie, con sus usos', () => {
    const c = buildCharacter(choices({ species: 'Goliat' }));
    expect(c.speed).toBe('10,5 m');
    expect(c.features.filter((f) => f.source === 'Goliat').map((f) => [f.name, f.uses?.max ?? null])).toEqual([
      ['Ascendencia gigante', 2], ['Forma grande', null], ['Complexión poderosa', null],
    ]);
    // Los rasgos son copias: cambiar la ficha no toca el listado.
    c.features.find((f) => f.name === 'Ascendencia gigante')!.uses!.current = 0;
    expect(findSpecies('Goliat')!.traits[0].uses!.current).toBe(2);
  });

  it('especie y trasfondo caseros: texto libre, velocidad 9 m y solo los rasgos de clase', () => {
    const c = buildCharacter(choices({ species: 'Elfo marino', background: 'Pescador' }));
    expect(c.species).toBe('Elfo marino');
    expect(c.speed).toBe('9 m');
    expect(c.skills).toEqual({ investigacion: 1, medicina: 1 });
    expect(c.features.map((f) => f.source)).toEqual(['Mago 1']);
  });
});
