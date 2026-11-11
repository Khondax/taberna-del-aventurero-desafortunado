import { describe, expect, it } from 'vitest';
import { weaponCatalog } from '../../src/data/catalog';
import { spellCatalog } from '../../src/data/spells';
import { armorClassBreakdown, rollExpression, slotTableAt, spellDice, weaponAbility, weaponAttack } from '../../src/lib/sheet';
import { character, equipped } from './fixtures';

/** Arma del listado con competencia (el listado las trae sin ella; la decide la clase al añadirla). */
const weapon = (name: string) => ({ ...weaponCatalog.find((entry) => entry.name === name)!, proficient: true });
const spell = (name: string) => spellCatalog.find((entry) => entry.name === name)!;
const slots = (className: string, level: number) => slotTableAt(character({ className }), level);

describe('slotTableAt', () => {
  it('lanzador completo', () => {
    expect(slots('Mago', 1)).toEqual([2]);
    expect(slots('Clérigo', 5)).toEqual([4, 3, 2]);
    expect(slots('Bardo', 20)).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
  });

  it('lanzador medio: paladín y explorador', () => {
    expect(slots('Paladín', 1)).toEqual([2]);
    expect(slots('Paladín', 5)).toEqual([4, 2]);
    expect(slots('Explorador', 9)).toEqual([4, 3, 2]);
    expect(slots('Explorador', 20)).toEqual([4, 3, 3, 3, 2]);
  });

  it('magia de pacto: todos los espacios del mismo nivel', () => {
    expect(slots('Brujo', 1)).toEqual([1]);
    expect(slots('Brujo', 3)).toEqual([0, 2]);
    expect(slots('Bruja', 11)).toEqual([0, 0, 0, 0, 3]);
    expect(slots('Brujo', 20)).toEqual([0, 0, 0, 0, 4]);
  });

  it('las clases sin conjuros no tienen tabla', () => {
    expect(slots('Guerrera', 5)).toBeNull();
    expect(slots('Inventada', 5)).toBeNull();
  });
});

describe('armorClassBreakdown', () => {
  const dex14 = { fue: 10, des: 14, con: 16, int: 10, sab: 16, car: 10 };
  const dex18 = { ...dex14, des: 18 };

  it('sin armadura: 10 + DES', () => {
    expect(armorClassBreakdown(character({ abilities: dex14 }))).toEqual({ total: 12, parts: ['sin armadura 10', 'DES +2'] });
  });

  it('ligera: base + DES completa', () => {
    expect(armorClassBreakdown(character({ abilities: dex18, inventory: [equipped('Cuero tachonado')] })).total).toBe(16);
  });

  it('intermedia: DES como mucho +2', () => {
    const { total, parts } = armorClassBreakdown(character({ abilities: dex18, inventory: [equipped('Cota de escamas')] }));
    expect(total).toBe(16);
    expect(parts).toEqual(['Cota de escamas 14', 'DES +2 (máx. +2)']);
  });

  it('pesada: ignora la DES', () => {
    expect(armorClassBreakdown(character({ abilities: dex18, inventory: [equipped('Cota de mallas')] }))).toEqual({ total: 16, parts: ['Cota de mallas 16'] });
  });

  it('escudo y otros bonificadores se suman', () => {
    const c = character({ abilities: dex14, acBonus: 1, inventory: [equipped('Cota de mallas'), equipped('Escudo')] });
    expect(armorClassBreakdown(c)).toEqual({ total: 19, parts: ['Cota de mallas 16', 'Escudo +2', 'otros +1'] });
  });

  it('la armadura sin equipar no cuenta', () => {
    expect(armorClassBreakdown(character({ abilities: dex14, inventory: [{ ...equipped('Cota de mallas'), equipped: false }] })).total).toBe(12);
  });

  it('Defensa sin armadura del bárbaro: 10 + DES + CON, también con escudo', () => {
    expect(armorClassBreakdown(character({ className: 'Bárbaro', abilities: dex14 })).total).toBe(15);
    expect(armorClassBreakdown(character({ className: 'Bárbara', abilities: dex14, inventory: [equipped('Escudo')] })).total).toBe(17);
    expect(armorClassBreakdown(character({ className: 'Bárbaro', abilities: dex14, inventory: [equipped('Cota de mallas')] })).total).toBe(16);
  });

  it('Defensa sin armadura del monje: 10 + DES + SAB, que se pierde con escudo', () => {
    expect(armorClassBreakdown(character({ className: 'Monje', abilities: dex14 }))).toEqual({ total: 15, parts: ['sin armadura 10', 'DES +2', 'SAB +3'] });
    expect(armorClassBreakdown(character({ className: 'Monja', abilities: dex14, inventory: [equipped('Escudo')] })).total).toBe(14);
  });
});

describe('weaponAttack', () => {
  const nimble = character({ abilities: { fue: 10, des: 16, con: 10, int: 10, sab: 10, car: 10 } }); // nivel 5: competencia +3
  const strong = character({ abilities: { fue: 18, des: 12, con: 10, int: 10, sab: 10, car: 10 } });

  it('Sutil usa la mejor de FUE y DES', () => {
    expect(weaponAbility(nimble, weapon('Daga'))).toBe('des');
    expect(weaponAttack(nimble, weapon('Daga'))).toBe(6);
    expect(weaponAbility(strong, weapon('Estoque'))).toBe('fue');
    expect(weaponAttack(strong, weapon('Estoque'))).toBe(7);
  });

  it('cuerpo a cuerpo usa FUE y a distancia DES', () => {
    expect(weaponAttack(nimble, weapon('Bastón'))).toBe(3);
    expect(weaponAttack(strong, weapon('Arco largo'))).toBe(4);
  });

  it('sin competencia no suma el bonificador y suma el bonificador mágico', () => {
    expect(weaponAttack(nimble, { ...weapon('Daga'), proficient: false })).toBe(3);
    expect(weaponAttack(nimble, { ...weapon('Daga'), magicBonus: 1 })).toBe(7);
  });
});

describe('spellDice', () => {
  it('los trucos escalan a nivel 5, 11 y 17', () => {
    const fireBolt = spell('Rayo de fuego');
    expect([1, 4, 5, 10, 11, 16, 17, 20].map((level) => spellDice(character({ level }), fireBolt))).toEqual([
      '1d10', '1d10', '2d10', '2d10', '3d10', '3d10', '4d10', '4d10',
    ]);
  });

  it('los conjuros con nivel no escalan', () => {
    expect(spellDice(character({ level: 17 }), spell('Manos ardientes'))).toBe('3d6');
  });
});

describe('rollExpression', () => {
  it('tira dados con modificador', () => {
    expect(rollExpression('2d6', () => 0)).toEqual({ rolls: [1, 1], total: 2 });
    expect(rollExpression('2d6', () => 0.999)).toEqual({ rolls: [6, 6], total: 12 });
    expect(rollExpression(' 1d4 + 1 ', () => 0.5)).toEqual({ rolls: [3], total: 4 });
    expect(rollExpression('1d8-2', () => 0)).toEqual({ rolls: [1], total: -1 });
  });

  it('acepta un número fijo', () => {
    expect(rollExpression('3')).toEqual({ rolls: [3], total: 3 });
  });

  it('devuelve null si no entiende la expresión', () => {
    expect(rollExpression('abc')).toBeNull();
    expect(rollExpression('2d6+')).toBeNull();
    expect(rollExpression('')).toBeNull();
  });
});
