// Convierte archivos de ficha de versiones anteriores a la actual antes de validarlos.
// Los datos vienen de disco o de un archivo importado, así que se tratan como `any` y
// el esquema actual los valida después.
import { featureCatalog, itemCatalog, weaponCatalog } from '../data/catalog';
import { spellCatalog } from '../data/spells';
import { armorClass, classInfo, defaultWeaponProficiency, normalize } from './sheet';
import type { Character, Feature, Spell, Weapon } from './schema';

const findByName = <T extends { name: string }>(list: T[], name: string) =>
  list.find((entry) => normalize(entry.name) === normalize(name));

/** v1 → v2: habilidades, salvaciones, aptitud mágica, armas separadas y usos dentro de cada rasgo u objeto. */
function v1ToV2(file: any): any {
  const c = file.character ?? {};
  const info = classInfo(c.className ?? '');

  const features: Feature[] = (c.features ?? []).map((f: any) => ({ name: f.name, source: '', description: f.description ?? '', uses: null }));
  for (const r of c.resources ?? []) {
    const uses = { current: r.current, max: r.max, recovery: r.recovery };
    const feature = features.find((f) => normalize(f.name) === normalize(r.name));
    if (feature) feature.uses = uses;
    else features.push({ name: r.name, source: '', description: '', uses });
  }

  const spells: Spell[] = (c.spells ?? []).map((s: any) => ({
    ...(findByName(spellCatalog, s.name) ?? {
      range: '', components: '', duration: '', concentration: false, ritual: false, description: '',
      effect: null, save: null, attack: false, higherLevels: '',
    }),
    name: s.name, level: s.level, school: s.school, casting: s.casting,
  }));

  const character = { className: c.className ?? '' } as Character;
  const weapons: Weapon[] = [];
  const inventory: any[] = []; // forma v2: sin `equipped` ni `armor`, que añade v2ToV3
  for (const item of c.inventory ?? []) {
    const quantity = Number(/×\s*(\d+)/.exec(item.tag ?? '')?.[1] ?? 1);
    const weapon = findByName(weaponCatalog, item.name);
    if (weapon) {
      for (let n = 0; n < quantity; n++) weapons.push({ ...weapon, proficient: defaultWeaponProficiency(character, weapon) });
      continue;
    }
    const known = findByName(itemCatalog, item.name);
    inventory.push({
      name: item.name,
      kind: item.kind ?? '',
      quantity,
      weightKg: quantity > 0 ? (item.weightKg ?? 0) / quantity : 0,
      description: known?.description ?? '',
      uses: known?.uses ?? null,
    });
  }

  const { resources: _resources, perceptionProficient: _perception, ...rest } = c;
  return {
    ...file,
    schemaVersion: 2,
    character: {
      ...rest,
      savingThrows: info?.saves ?? [],
      skills: c.perceptionProficient ? { percepcion: 1 } : {},
      spellcastingAbility: info?.spellcasting ?? null,
      features,
      spells,
      weapons,
      inventory,
    },
  };
}

/**
 * v2 → v3: la CA se calcula desde la armadura equipada. Las armaduras y escudos conocidos
 * del inventario se marcan como equipados (uno por hueco) y `acBonus` recoge la diferencia
 * para que la CA de la ficha no cambie.
 */
function v2ToV3(file: any): any {
  const { armorClass: oldArmorClass, ...c } = file.character ?? {};
  const worn = new Set<string>();
  const inventory = (c.inventory ?? []).map((item: any) => {
    const armor = findByName(itemCatalog, item.name)?.armor ?? null;
    const slot = armor?.kind === 'escudo' ? 'escudo' : 'cuerpo';
    const equipped = Boolean(armor) && !worn.has(slot);
    if (equipped) worn.add(slot);
    return { ...item, equipped, armor };
  });
  const character = { ...c, inventory, acBonus: 0 };
  if (typeof oldArmorClass === 'number') character.acBonus = oldArmorClass - armorClass(character as Character);
  return { ...file, schemaVersion: 3, character };
}

/** v3 → v4: estado en partida (PG temporales, salvaciones contra la muerte, concentración, estados y agotamiento) y monedas. */
function v3ToV4(file: any): any {
  const c = file.character ?? {};
  return {
    ...file,
    schemaVersion: 4,
    character: {
      ...c,
      hp: { ...c.hp, temp: 0 },
      deathSaves: { successes: 0, failures: 0, stable: false },
      concentration: null,
      conditions: [],
      exhaustion: 0,
      coins: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 },
    },
  };
}

/** Rasgos del listado que recuperan uno en descanso corto y todos en largo. */
const partialRecovery = new Set(featureCatalog.filter((f) => f.uses?.recovery === 'uno-corto').map((f) => f.name));

/**
 * v4 → v5: recuperación parcial (`uno-corto`). Solo cambia los rasgos cuyo nombre coincide
 * exactamente con uno del listado que la usa y que siguen en descanso largo, que es como los
 * añadía el listado hasta ahora. Si alguien eligió otra recuperación a mano, se respeta.
 */
function v4ToV5(file: any): any {
  const c = file.character ?? {};
  const features = (c.features ?? []).map((f: any) =>
    f.uses?.recovery === 'largo' && partialRecovery.has(f.name) ? { ...f, uses: { ...f.uses, recovery: 'uno-corto' } } : f,
  );
  return { ...file, schemaVersion: 5, character: { ...c, features } };
}

const steps: Record<number, (file: any) => any> = { 1: v1ToV2, 2: v2ToV3, 3: v3ToV4, 4: v4ToV5 };

/** Aplica los pasos necesarios hasta la versión actual. Lo que no sea un objeto se devuelve tal cual. */
export function migrate(raw: unknown): unknown {
  let file = raw as any;
  while (file && typeof file === 'object' && steps[file.schemaVersion]) file = steps[file.schemaVersion](file);
  return file;
}
