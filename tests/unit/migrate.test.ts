import { describe, expect, it } from 'vitest';
import { migrate } from '../../src/lib/migrate';
import { currentSchemaVersion, sheetFileSchema } from '../../src/lib/schema';
import { armorClass, skillBonus } from '../../src/lib/sheet';
import { example, v2Example, v3Example, v4Example } from './fixtures';

const toCurrent = (file: unknown) => sheetFileSchema.parse(migrate(file));

const v1 = (character: Record<string, unknown>) => ({
  schemaVersion: 1,
  version: 3,
  character: {
    name: 'Viejo Formato', species: 'Mediano', className: 'Pícaro', subclass: '', background: '', alignment: '',
    level: 2, xp: 300, abilities: { fue: 8, des: 16, con: 12, int: 12, sab: 10, car: 14 }, armorClass: 14, speed: '9 m',
    perceptionProficient: true, hp: { current: 13, max: 13 }, hitDice: { current: 2, max: 2, die: 'd8' }, spellSlots: {},
    resources: [{ name: 'Astucia', current: 1, max: 2, recovery: 'corto' }],
    features: [{ name: 'Astucia', description: 'Acción adicional.' }],
    spells: [{ name: 'Rayo de fuego', level: 0, school: 'Evocación', casting: '1 acción' }],
    inventory: [{ name: 'Daga', kind: 'Arma', weightKg: 1, tag: '× 2' }, { name: 'Cuerda', kind: 'Equipo', weightKg: 2 }],
    history: [], notes: '',
    ...character,
  },
});

describe('migrate', () => {
  it('v3 → v4 añade el estado en partida y las monedas sin tocar el resto', () => {
    const old = v3Example('hermano-tobias');
    const v4 = v4Example('hermano-tobias');
    // El archivo v4 guardado es justo esta migración: se compara con él y luego se llevan los dos al formato actual.
    const { hp, deathSaves, concentration, conditions, exhaustion, coins, ...rest } = v4.character;
    expect(hp).toEqual({ ...old.character.hp, temp: 0 });
    expect({ deathSaves, concentration, conditions, exhaustion, coins }).toEqual({
      deathSaves: { successes: 0, failures: 0, stable: false },
      concentration: null,
      conditions: [],
      exhaustion: 0,
      coins: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 },
    });
    const { hp: _hp, ...oldRest } = old.character;
    expect(rest).toEqual(oldRest);
    const file = toCurrent(old);
    expect(file.version).toBe(old.version);
    expect(file).toEqual(toCurrent(v4));
  });

  it('v4 → v5: los ejemplos de data/ejemplos son la migración real', () => {
    expect(toCurrent(v4Example('hermano-tobias')).character).toEqual(example('hermano-tobias'));
  });

  it('v4 → v5: una única clase con su subclase y nivel, y los dados de golpe en una lista', () => {
    const old = v4Example('hermano-tobias');
    const { character } = toCurrent(old);
    expect(character.classes).toEqual([{ name: 'Clérigo', subclass: 'Dominio de la Vida', level: 5 }]);
    expect(character.hitDice).toEqual([old.character.hitDice]);
    expect(character.spellSlots).toEqual(old.character.spellSlots);
    expect(character.pactSlots).toBeNull();
    for (const key of ['className', 'subclass', 'level']) expect(character).not.toHaveProperty(key);
  });

  it('v4 → v5: los espacios del brujo pasan a la magia de pacto', () => {
    const old = v4Example('hermano-tobias');
    Object.assign(old.character, { className: 'Bruja', level: 3, spellSlots: { 2: { current: 1, max: 2 } } });
    expect(toCurrent(old).character).toMatchObject({ spellSlots: {}, pactSlots: { level: 2, current: 1, max: 2 } });
  });

  it('v4 → v5 marca la recuperación parcial solo en los rasgos del listado que seguían en descanso largo', () => {
    const old = v4Example('hermano-tobias');
    const uses = (recovery: string) => ({ current: 1, max: 2, recovery });
    old.character.features = [
      { name: 'Canalizar divinidad', source: '', description: '', uses: uses('largo') },
      { name: 'Tomar aliento', source: '', description: '', uses: uses('corto') }, // elegido a mano: se respeta
      { name: 'furia', source: '', description: '', uses: uses('largo') }, // no coincide exactamente
      { name: 'Canalizar divinidad (paladín)', source: '', description: '', uses: uses('largo') },
      { name: 'Recuperación arcana', source: '', description: '', uses: uses('largo') }, // no es parcial
    ];
    const { character } = toCurrent(old);
    expect(character.features.map((f) => f.uses?.recovery)).toEqual(['uno-corto', 'corto', 'largo', 'uno-corto', 'largo']);
  });

  it('v2 → v4 no cambia la CA de los ejemplos', () => {
    for (const slug of ['arannis-valebright', 'brunilda-martillo-de-hierro', 'hermano-tobias']) {
      const old = v2Example(slug);
      const file = toCurrent(old);
      expect(file.schemaVersion).toBe(currentSchemaVersion);
      expect(file.version).toBe(old.version);
      expect(armorClass(file.character)).toBe(old.character.armorClass);
    }
  });

  it('v2 → v3 equipa una armadura y un escudo y guarda el resto en «otros»', () => {
    const old = v2Example('hermano-tobias');
    old.character.armorClass += 1;
    old.character.inventory.push({ ...old.character.inventory[0] }, { ...old.character.inventory[1] });
    const { character } = toCurrent(old);
    expect(character.inventory.filter((item) => item.equipped).map((item) => item.name)).toEqual(['Cota de escamas', 'Escudo']);
    expect(character.acBonus).toBe(1);
    expect(armorClass(character)).toBe(old.character.armorClass);
  });

  it('v1 → v4 completa armas, conjuros y rasgos sin cambiar la CA', () => {
    const { character } = toCurrent(v1({}));
    expect(armorClass(character)).toBe(14);
    expect(character.acBonus).toBe(1); // 10 + DES 3 = 13, la diferencia va a «otros»
    expect(character.weapons.map((w) => [w.name, w.proficient])).toEqual([['Daga', true], ['Daga', true]]);
    expect(character.inventory.map((item) => item.name)).toEqual(['Cuerda']);
    expect(character.spells[0].effect?.dice).toBe('1d10');
    expect(character.features).toEqual([{ name: 'Astucia', source: '', description: 'Acción adicional.', uses: { current: 1, max: 2, recovery: 'corto' } }]);
    expect(character.savingThrows).toEqual(['des', 'int']);
    expect(skillBonus(character, 'percepcion')).toBe(2);
  });

  it('v1 → v4 con armadura en el inventario', () => {
    const { character } = toCurrent(v1({ armorClass: 15, inventory: [{ name: 'Cuero tachonado', kind: 'Armadura', weightKg: 6.5 }] }));
    expect(character.inventory[0]).toMatchObject({ equipped: true, armor: { kind: 'ligera', base: 12 } });
    expect(character.acBonus).toBe(0);
    expect(armorClass(character)).toBe(15);
  });

  it('deja tal cual lo que no es un objeto o ya está en la versión actual', () => {
    expect(migrate('texto')).toBe('texto');
    expect(migrate(null)).toBeNull();
    const current = { schemaVersion: currentSchemaVersion, version: 1, character: {} };
    expect(migrate(current)).toBe(current);
  });
});
