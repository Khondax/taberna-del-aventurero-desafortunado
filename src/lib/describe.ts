// Descripción detallada de un elemento de la ficha para el tooltip y el diálogo de edición.
// Siempre explica de dónde sale cada número (característica, competencia, bonificador mágico).
import {
  abilities,
  abilityMod,
  abilityNames,
  abilityShort,
  damageText,
  formatNumber,
  hasProperty,
  proficiencyBonus,
  recoveryText,
  saveBonus,
  signed,
  skillBonus,
  skillIds,
  skillLevel,
  skills,
  spellAttackBonus,
  spellcastingMod,
  spellDice,
  spellLevelText,
  spellSaveDC,
  weaponAbility,
  weaponAttack,
  weaponDamageBonus,
  type Ability,
  type Character,
  type SkillId,
} from './sheet';

export interface Description {
  title: string;
  subtitle: string;
  /** Pares etiqueta/valor; se omiten los vacíos. */
  facts: [string, string][];
  text: string;
}

/** Maestrías de arma de 2024 (resumen propio). */
export const masteries: Record<string, string> = {
  Derribar: 'Al impactar, el objetivo salva Con (CD 8 + modificador del ataque + competencia) o queda derribado.',
  Empujar: 'Al impactar, puedes empujar al objetivo hasta 3 m si es Grande o menor.',
  Hendir: 'Una vez por turno, al impactar cuerpo a cuerpo puedes atacar a otra criatura a 1,5 m del objetivo; ese daño no suma el modificador.',
  Hostigar: 'Al impactar y dañar, tienes ventaja en tu siguiente ataque contra esa criatura antes de que termine tu próximo turno.',
  Mellar: 'El ataque adicional de la propiedad Ligera forma parte de la acción de Ataque, una vez por turno.',
  Ralentizar: 'Al impactar y dañar, la velocidad del objetivo baja 3 m hasta el inicio de tu próximo turno.',
  Debilitar: 'Al impactar, el objetivo tiene desventaja en su siguiente tirada de ataque antes de tu próximo turno.',
  Rozar: 'Si fallas, infliges daño igual al modificador de característica del ataque.',
};

const part = (label: string, value: number) => `${label} ${signed(value)}`;
const sum = (total: number, parts: string[]) => `${signed(total)} = ${parts.join(' + ')}`;
const proficiencyPart = (c: Character, times = 1) =>
  part(times === 2 ? 'pericia' : 'competencia', proficiencyBonus(c.level) * times);

function describeWeapon(c: Character, i: number): Description | null {
  const w = c.weapons[i];
  if (!w) return null;
  const ability = weaponAbility(c, w);
  const attackParts = [part(abilityShort(ability), abilityMod(c, ability))];
  if (w.proficient) attackParts.push(proficiencyPart(c));
  if (w.magicBonus) attackParts.push(part('mágica', w.magicBonus));
  const bonus = weaponDamageBonus(c, w);
  return {
    title: w.magicBonus ? `${w.name} ${signed(w.magicBonus)}` : w.name,
    subtitle: `Arma ${w.category} ${w.ranged ? 'a distancia' : 'cuerpo a cuerpo'}`,
    facts: [
      ['Ataque', sum(weaponAttack(c, w), attackParts)],
      ['Daño', damageText(w.damage, bonus, w.damageType)],
      ['A dos manos', w.versatile ? damageText(w.versatile, bonus, w.damageType) : ''],
      ['Característica', `${abilityNames[ability]}${hasProperty(w, 'sutil') ? ' (Sutil: la mejor entre Fuerza y Destreza)' : ''}`],
      ['Competencia', w.proficient ? 'Sí' : 'No: no sumas tu bonificador al ataque'],
      ['Propiedades', w.properties.join(', ')],
      ['Alcance', w.range],
      ['Maestría', w.mastery ? `${w.mastery}. ${masteries[w.mastery] ?? ''}`.trim() : ''],
      ['Peso', `${formatNumber(w.weightKg)} kg`],
    ],
    text: w.description,
  };
}

function describeSpell(c: Character, i: number): Description | null {
  const s = c.spells[i];
  if (!s) return null;
  const ability = c.spellcastingAbility;
  const castingParts = ability ? [proficiencyPart(c), part(abilityShort(ability), spellcastingMod(c))] : [];
  const noAbility = 'Elige la aptitud mágica en el grimorio';
  let effect = '';
  if (s.effect) {
    const scaled = spellDice(c, s) !== s.effect.dice ? ` (truco a nivel ${c.level})` : '';
    effect = damageText(spellDice(c, s), s.effect.addModifier ? spellcastingMod(c) : 0, s.effect.type) + scaled;
    if (s.effect.addModifier) effect += ability ? ` · suma ${part(abilityShort(ability), spellcastingMod(c))}` : ` · ${noAbility}`;
  }
  return {
    title: s.name,
    subtitle: [`${spellLevelText(s.level)} · ${s.school}`, s.ritual && 'ritual'].filter(Boolean).join(' · '),
    facts: [
      ['Lanzamiento', s.casting],
      ['Alcance', s.range],
      ['Componentes', s.components],
      ['Duración', s.concentration ? `Concentración, ${s.duration}` : s.duration],
      ['Ataque', s.attack ? (ability ? sum(spellAttackBonus(c), castingParts) : noAbility) : ''],
      ['Salvación', s.save ? `${abilityNames[s.save]} · ${ability ? `CD ${spellSaveDC(c)} = 8 + ${castingParts.join(' + ')}` : noAbility}` : ''],
      ['Efecto', effect],
      ['Niveles superiores', s.higherLevels],
    ],
    text: s.description,
  };
}

function describeItem(c: Character, i: number): Description | null {
  const item = c.inventory[i];
  if (!item) return null;
  return {
    title: item.name,
    subtitle: item.kind,
    facts: [
      ['Cantidad', String(item.quantity)],
      ['Peso', `${formatNumber(item.weightKg)} kg c/u · ${formatNumber(item.weightKg * item.quantity)} kg en total`],
      ['Usos', item.uses ? `${item.uses.current} / ${item.uses.max} · ${recoveryText(item.uses)}` : ''],
    ],
    text: item.description,
  };
}

function describeFeature(c: Character, i: number): Description | null {
  const f = c.features[i];
  if (!f) return null;
  return {
    title: f.name,
    subtitle: f.source || 'Rasgo',
    facts: [['Usos', f.uses ? `${f.uses.current} / ${f.uses.max} · ${recoveryText(f.uses)}` : '']],
    text: f.description,
  };
}

function describeSkill(c: Character, skill: SkillId): Description {
  const { name, ability, description } = skills[skill];
  const level = skillLevel(c, skill);
  const parts = [part(abilityShort(ability), abilityMod(c, ability))];
  if (level) parts.push(proficiencyPart(c, level));
  return {
    title: name,
    subtitle: `Habilidad de ${abilityNames[ability]}`,
    facts: [
      ['Bonificador', sum(skillBonus(c, skill), parts)],
      ['Competencia', ['No (pulsa el círculo para marcarla)', 'Competente', 'Pericia (doble competencia)'][level]],
    ],
    text: description,
  };
}

function describeSave(c: Character, ability: Ability): Description {
  const proficient = c.savingThrows.includes(ability);
  const parts = [part(abilityShort(ability), abilityMod(c, ability))];
  if (proficient) parts.push(proficiencyPart(c));
  return {
    title: `Salvación de ${abilityNames[ability]}`,
    subtitle: proficient ? 'Competente' : 'Sin competencia',
    facts: [['Bonificador', sum(saveBonus(c, ability), parts)]],
    text: 'Pulsa el círculo para cambiar la competencia y el nombre para tirar.',
  };
}

function describeAbility(c: Character, ability: Ability): Description {
  const related = skillIds.filter((id) => skills[id].ability === ability).map((id) => skills[id].name);
  return {
    title: abilityNames[ability],
    subtitle: `Puntuación ${c.abilities[ability]}`,
    facts: [
      ['Modificador', `${signed(abilityMod(c, ability))} = (${c.abilities[ability]} − 10) / 2, redondeando hacia abajo`],
      ['Salvación', signed(saveBonus(c, ability))],
      ['Habilidades', related.join(', ') || 'Ninguna'],
    ],
    text: 'Pulsa el modificador para hacer una prueba (d20 + modificador).',
  };
}

/** `key` tiene la forma `tipo:índice`, p. ej. `weapons:0`, `skills:atletismo` o `abilities:fue`. */
export function describe(c: Character, key: string): Description | null {
  const [kind, id] = key.split(':');
  const index = Number(id);
  switch (kind) {
    case 'weapons': return describeWeapon(c, index);
    case 'spells': return describeSpell(c, index);
    case 'inventory': return describeItem(c, index);
    case 'features': return describeFeature(c, index);
    case 'skills': return id in skills ? describeSkill(c, id as SkillId) : null;
    case 'saves': return (abilities as readonly string[]).includes(id) ? describeSave(c, id as Ability) : null;
    case 'abilities': return (abilities as readonly string[]).includes(id) ? describeAbility(c, id as Ability) : null;
    default: return null;
  }
}
