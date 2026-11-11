import { describe, expect, it } from 'vitest';
import { weaponCatalog } from '../../src/data/catalog';
import { spellCatalog } from '../../src/data/spells';
import {
  armorClassBreakdown,
  carriedWeight,
  concentrationDC,
  deathSave,
  exhaustionPenalty,
  gainTempHp,
  heal,
  liveText,
  longRest,
  recoveryText,
  rollExpression,
  shortRest,
  spellSlotTable,
  pactSlotTable,
  characterLevel,
  proficiency,
  classText,
  defaultWeaponProficiency,
  castingByClass,
  spellDice,
  takeDamage,
  weaponAbility,
  weaponAttack,
} from '../../src/lib/sheet';
import { character, equipped, singleClass } from './fixtures';

/** Arma del listado con competencia (el listado las trae sin ella; la decide la clase al añadirla). */
const weapon = (name: string) => ({ ...weaponCatalog.find((entry) => entry.name === name)!, proficient: true });
const spell = (name: string) => spellCatalog.find((entry) => entry.name === name)!;
const classes = (...entries: [string, number][]) => entries.map(([name, level]) => ({ name, subclass: '', level }));
const slots = (className: string, level: number) => spellSlotTable(classes([className, level]));

describe('spellSlotTable', () => {
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

  it('las clases sin conjuros, el brujo y las caseras no tienen tabla', () => {
    expect(slots('Guerrera', 5)).toBeNull();
    expect(slots('Brujo', 5)).toBeNull();
    expect(slots('Inventada', 5)).toBeNull();
  });

  it('multiclase: completos enteros y medios la mitad redondeando hacia arriba, con la tabla completa', () => {
    expect(spellSlotTable(classes(['Mago', 3], ['Paladín', 2]))).toEqual([4, 3]); // lanzador de nivel 4
    expect(spellSlotTable(classes(['Clérigo', 1], ['Explorador', 3]))).toEqual([4, 2]); // 1 + 2 = nivel 3
    expect(spellSlotTable(classes(['Paladín', 1], ['Explorador', 1]))).toEqual([3]); // 1 + 1, cada clase por separado
  });

  it('multiclase con una sola clase lanzadora: su propia tabla', () => {
    expect(spellSlotTable(classes(['Mago', 3], ['Guerrero', 2]))).toEqual([4, 2]);
    expect(spellSlotTable(classes(['Guerrero', 2], ['Paladín', 5]))).toEqual([4, 2]);
  });
});

describe('pactSlotTable', () => {
  it('magia de pacto: todos los espacios del mismo nivel', () => {
    expect(pactSlotTable(classes(['Brujo', 1]))).toEqual({ level: 1, max: 1 });
    expect(pactSlotTable(classes(['Brujo', 3]))).toEqual({ level: 2, max: 2 });
    expect(pactSlotTable(classes(['Bruja', 11]))).toEqual({ level: 5, max: 3 });
    expect(pactSlotTable(classes(['Brujo', 20]))).toEqual({ level: 5, max: 4 });
    expect(pactSlotTable(classes(['Mago', 5]))).toBeNull();
  });

  it('Brujo 2 / Hechicero 3: el pacto va aparte de los espacios del hechicero', () => {
    const multi = classes(['Brujo', 2], ['Hechicero', 3]);
    expect(pactSlotTable(multi)).toEqual({ level: 1, max: 2 });
    expect(spellSlotTable(multi)).toEqual([4, 2]);
  });
});

describe('multiclase', () => {
  const multi = character({ classes: classes(['Mago', 3], ['Guerrero', 2]) });

  it('el nivel y la competencia dependen del nivel total', () => {
    expect(characterLevel(multi)).toBe(5);
    expect(proficiency(multi)).toBe(3);
    expect(liveText(multi).eyebrow).toBe('Nivel 5 · competencia +3');
  });

  it('las clases se muestran con su nivel; con una sola, con la subclase', () => {
    expect(classText(multi)).toBe('Mago 3 / Guerrero 2');
    expect(classText(character({ classes: [{ name: 'Mago', subclass: 'Evocador', level: 5 }] }))).toBe('Mago evocador');
  });

  it('una sola Defensa sin armadura: la de la primera clase que la da', () => {
    const abilities = { fue: 10, des: 14, con: 16, int: 10, sab: 16, car: 10 };
    expect(armorClassBreakdown(character({ abilities, classes: classes(['Monje', 2], ['Bárbaro', 1]) })).parts).toContain('SAB +3');
    expect(armorClassBreakdown(character({ abilities, classes: classes(['Mago', 2], ['Bárbaro', 1]) })).parts).toContain('CON +3');
  });

  it('las armas marciales vienen de la primera clase o de una posterior que las dé todas', () => {
    const longsword = weaponCatalog.find((w) => w.name === 'Espada larga')!;
    expect(defaultWeaponProficiency(character(singleClass('Mago')), longsword)).toBe(false);
    expect(defaultWeaponProficiency(multi, longsword)).toBe(true);
  });

  it('CD y ataque por clase solo con aptitudes distintas', () => {
    const arannis = character({ classes: classes(['Mago', 3], ['Clérigo', 2]), spellcastingAbility: 'int' });
    expect(castingByClass(arannis)).toBe('Mago (INT): CD 15, ataque +7 · Clérigo (SAB): CD 12, ataque +4');
    expect(castingByClass(character({ classes: classes(['Mago', 3], ['Guerrero', 2]), spellcastingAbility: 'int' }))).toBe('');
  });

  it('descansos: el pacto vuelve en descanso corto y todos los dados de golpe en largo', () => {
    const c = character({
      classes: classes(['Brujo', 2], ['Hechicero', 3]),
      spellSlots: { 1: { current: 0, max: 4 } },
      pactSlots: { level: 1, current: 0, max: 2 },
      hitDice: [{ die: 'd8', current: 0, max: 2 }, { die: 'd6', current: 1, max: 3 }],
      features: [],
      inventory: [],
    });
    expect(shortRest(c)).toEqual(['espacios de pacto']);
    expect(c.pactSlots!.current).toBe(2);
    expect(c.spellSlots[1].current).toBe(0);
    longRest(c);
    expect(c.spellSlots[1].current).toBe(4);
    expect(c.hitDice.map((d) => d.current)).toEqual([2, 3]);
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
    expect(armorClassBreakdown(character({ ...singleClass('Bárbaro'), abilities: dex14 })).total).toBe(15);
    expect(armorClassBreakdown(character({ ...singleClass('Bárbara'), abilities: dex14, inventory: [equipped('Escudo')] })).total).toBe(17);
    expect(armorClassBreakdown(character({ ...singleClass('Bárbaro'), abilities: dex14, inventory: [equipped('Cota de mallas')] })).total).toBe(16);
  });

  it('Defensa sin armadura del monje: 10 + DES + SAB, que se pierde con escudo', () => {
    expect(armorClassBreakdown(character({ ...singleClass('Monje'), abilities: dex14 }))).toEqual({ total: 15, parts: ['sin armadura 10', 'DES +2', 'SAB +3'] });
    expect(armorClassBreakdown(character({ ...singleClass('Monja'), abilities: dex14, inventory: [equipped('Escudo')] })).total).toBe(14);
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
    expect([1, 4, 5, 10, 11, 16, 17, 20].map((level) => spellDice(character(singleClass('Mago', level)), fireBolt))).toEqual([
      '1d10', '1d10', '2d10', '2d10', '3d10', '3d10', '4d10', '4d10',
    ]);
  });

  it('los conjuros con nivel no escalan', () => {
    expect(spellDice(character(singleClass('Mago', 17)), spell('Manos ardientes'))).toBe('3d6');
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

/** Arannis con 27 PG máximos y los PG actuales y temporales indicados. */
const wounded = (current: number, temp = 0, overrides = {}) => character({ hp: { current, max: 27, temp }, ...overrides });

describe('takeDamage y PG temporales', () => {
  it('el daño gasta primero los PG temporales', () => {
    const c = wounded(20, 5);
    takeDamage(c, 3);
    expect(c.hp).toEqual({ current: 20, max: 27, temp: 2 });
    takeDamage(c, 6);
    expect(c.hp).toEqual({ current: 16, max: 27, temp: 0 });
  });

  it('no baja de 0 PG', () => {
    const c = wounded(4);
    takeDamage(c, 50);
    expect(c.hp.current).toBe(0);
  });

  it('la curación no suma PG temporales ni pasa del máximo', () => {
    const c = wounded(20, 5);
    heal(c, 30);
    expect(c.hp).toEqual({ current: 27, max: 27, temp: 5 });
  });

  it('los PG temporales no se acumulan: se queda el mayor', () => {
    const c = wounded(20, 5);
    gainTempHp(c, 3);
    expect(c.hp.temp).toBe(5);
    gainTempHp(c, 8);
    expect(c.hp.temp).toBe(8);
  });
});

describe('salvaciones contra la muerte', () => {
  const down = (deathSaves = { successes: 0, failures: 0, stable: false }, overrides = {}) => wounded(0, 0, { deathSaves, ...overrides });

  it('10 o más es éxito y menos, fallo', () => {
    const c = down();
    expect(deathSave(c, 10)).toBe('exito');
    expect(deathSave(c, 9)).toBe('fallo');
    expect(c.deathSaves).toEqual({ successes: 1, failures: 1, stable: false });
  });

  it('un 1 natural son dos fallos y tres fallos, la muerte', () => {
    const c = down({ successes: 0, failures: 1, stable: false });
    expect(deathSave(c, 1)).toBe('muerte');
    expect(c.deathSaves.failures).toBe(3);
  });

  it('un 20 natural recupera 1 PG y reinicia las casillas', () => {
    const c = down({ successes: 1, failures: 2, stable: false });
    expect(deathSave(c, 20)).toBe('recupera');
    expect(c.hp.current).toBe(1);
    expect(c.deathSaves).toEqual({ successes: 0, failures: 0, stable: false });
  });

  it('tres éxitos estabilizan y reinician las casillas', () => {
    const c = down({ successes: 2, failures: 2, stable: false });
    expect(deathSave(c, 15)).toBe('estable');
    expect(c.deathSaves).toEqual({ successes: 0, failures: 0, stable: true });
    expect(c.hp.current).toBe(0);
  });

  it('el agotamiento resta a la tirada, pero no a los naturales', () => {
    const c = down(undefined, { exhaustion: 1 });
    expect(deathSave(c, 11)).toBe('fallo');
    expect(deathSave(c, 12)).toBe('exito');
  });

  it('recibir daño a 0 PG suma un fallo y quita la estabilidad', () => {
    const c = down({ successes: 0, failures: 0, stable: true });
    takeDamage(c, 3);
    expect(c.deathSaves).toEqual({ successes: 0, failures: 1, stable: false });
  });

  it('a 0 PG, el daño que absorben los PG temporales no es un fallo', () => {
    const c = wounded(0, 5);
    takeDamage(c, 4);
    expect(c.deathSaves.failures).toBe(0);
    expect(c.hp.temp).toBe(1);
  });

  it('curarse reinicia las casillas', () => {
    const c = down({ successes: 2, failures: 1, stable: false });
    heal(c, 2);
    expect(c.hp.current).toBe(2);
    expect(c.deathSaves).toEqual({ successes: 0, failures: 0, stable: false });
  });
});

describe('concentración', () => {
  it('CD = máx(10, mitad del daño), hasta 30', () => {
    expect([1, 19, 21, 22, 45, 80].map(concentrationDC)).toEqual([10, 10, 10, 11, 22, 30]);
  });

  it('takeDamage devuelve la CD si se concentra, aunque el daño lo absorban los PG temporales', () => {
    expect(takeDamage(wounded(27, 0, { concentration: 'Bendición' }), 24)).toBe(12);
    expect(takeDamage(wounded(20, 30, { concentration: 'Bendición' }), 24)).toBe(12);
    expect(takeDamage(wounded(20), 24)).toBeNull();
  });

  it('caer a 0 PG termina la concentración', () => {
    const c = wounded(5, 0, { concentration: 'Bendición' });
    expect(takeDamage(c, 10)).toBeNull();
    expect(c.concentration).toBeNull();
  });
});

describe('agotamiento', () => {
  it('−2 por nivel a las pruebas d20', () => {
    expect([0, 1, 3, 6].map((exhaustion) => exhaustionPenalty(character({ exhaustion })))).toEqual([0, 2, 6, 12]);
  });

  it('−1,5 m por nivel a la velocidad', () => {
    expect(liveText(character({ exhaustion: 0 })).speedNote).toBe('');
    expect(liveText(character({ speed: '9 m', exhaustion: 2 })).speedNote).toBe('6 m con agotamiento');
    expect(liveText(character({ speed: '7,5 m', exhaustion: 1 })).speedNote).toBe('6 m con agotamiento');
    expect(liveText(character({ speed: '9 m', exhaustion: 6 })).speedNote).toBe('0 m con agotamiento');
    expect(liveText(character({ speed: 'normal', exhaustion: 1 })).speedNote).toBe('−1,5 m por agotamiento');
    expect(liveText(character({ exhaustion: 3 })).exhaustionNote).toBe('−6 a pruebas d20 · −4,5 m');
  });
});

describe('monedas', () => {
  it('50 monedas pesan 0,5 kg y cuentan para la carga', () => {
    const c = character({ weapons: [], coins: { pc: 20, pp: 0, pe: 0, po: 30, ppt: 0 } });
    expect(carriedWeight(c)).toBe(0.5);
    expect(liveText(c).weight).toBe('Carga · 0,5 kg (monedas 0,5 kg)');
  });
});

describe('descansos y recuperación parcial', () => {
  const uses = (current: number, max: number, recovery: 'corto' | 'uno-corto' | 'largo' | 'ninguna') => ({ current, max, recovery });
  const feature = (name: string, u: ReturnType<typeof uses>) => ({ name, source: '', description: '', uses: u });
  const resting = () =>
    character({
      ...singleClass('Bárbaro'),
      spellSlots: {},
      exhaustion: 0,
      features: [
        feature('Furia', uses(0, 3, 'uno-corto')),
        feature('Oleada de acción', uses(0, 1, 'corto')),
        feature('Recuperación arcana', uses(0, 1, 'largo')),
        feature('Inspiración heroica', uses(0, 1, 'ninguna')),
        feature('Tomar aliento', uses(2, 2, 'uno-corto')),
      ],
    });
  const currents = (c: ReturnType<typeof resting>) => c.features.map((f) => f.uses!.current);

  it('descanso corto: uno de los parciales, todos los de descanso corto', () => {
    const c = resting();
    expect(shortRest(c)).toEqual(['Furia (+1)', 'Oleada de acción']);
    expect(currents(c)).toEqual([1, 1, 0, 0, 2]);
    shortRest(c);
    expect(currents(c)).toEqual([2, 1, 0, 0, 2]);
  });

  it('descanso largo: todos menos los que no se recuperan', () => {
    const c = resting();
    longRest(c);
    expect(currents(c)).toEqual([3, 1, 1, 0, 2]);
  });

  it('texto de la recuperación', () => {
    expect(recoveryText(uses(1, 2, 'uno-corto'))).toBe('Uno en descanso corto, todos en largo');
    expect(recoveryText(uses(1, 2, 'corto'))).toBe('Descanso corto');
    expect(recoveryText(uses(1, 2, 'ninguna'))).toBe('No se recupera');
  });
});
