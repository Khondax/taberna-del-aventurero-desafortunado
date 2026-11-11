// Convierte archivos de ficha de versiones anteriores a la actual antes de validarlos.
// Los datos vienen de disco o de un archivo importado, así que se tratan como `any` y
// el esquema actual los valida después.
import { itemCatalog, weaponCatalog } from '../data/catalog';
import { spellCatalog } from '../data/spells';
import { classInfo, defaultWeaponProficiency, normalize } from './sheet';
import type { Character, Feature, InventoryItem, Spell, Weapon } from './schema';

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
  const inventory: InventoryItem[] = [];
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

const steps: Record<number, (file: any) => any> = { 1: v1ToV2 };

/** Aplica los pasos necesarios hasta la versión actual. Lo que no sea un objeto se devuelve tal cual. */
export function migrate(raw: unknown): unknown {
  let file = raw as any;
  while (file && typeof file === 'object' && steps[file.schemaVersion]) file = steps[file.schemaVersion](file);
  return file;
}
