// Trasfondos y especies del SRD 5.2 (resúmenes propios). Al crear un personaje, elegir uno de
// estos rellena sus habilidades, limita el bonificador de características y añade sus rasgos
// (ver `buildCharacter` en src/lib/create.ts). Los trasfondos y especies caseros se escriben a mano.
import { normalize } from '../lib/sheet';
import type { Ability, Feature, SkillId, Uses } from '../lib/schema';
import { featureCatalog } from './catalog';

export interface Background {
  name: string;
  /** Forma femenina, si es distinta («Acólita»). */
  feminine?: string;
  /** Las tres características entre las que se reparte el bonificador +2/+1 o +1/+1/+1. */
  abilities: [Ability, Ability, Ability];
  skills: [SkillId, SkillId];
  /** Dote de origen, lista para copiar a la ficha. */
  feat: Feature;
}

export interface Species {
  name: string;
  feminine?: string;
  size: string;
  speed: string;
  /** Rasgos, listos para copiar a la ficha. Los usos son los de nivel 1. */
  traits: Feature[];
}

/** Dote de origen del listado de rasgos; `list` es la lista de conjuros de Iniciado en la magia. */
function originFeat(name: string, background: string, list?: string): Feature {
  const feat = structuredClone(featureCatalog.find((entry) => entry.name === name)!);
  return { ...feat, name: list ? `${name} (${list})` : name, source: `Dote de origen · ${background}` };
}

export const backgroundCatalog: Background[] = [
  { name: 'Acólito', feminine: 'Acólita', abilities: ['int', 'sab', 'car'], skills: ['perspicacia', 'religion'], feat: originFeat('Iniciado en la magia', 'Acólito', 'clérigo') },
  { name: 'Criminal', abilities: ['des', 'con', 'int'], skills: ['juegoDeManos', 'sigilo'], feat: originFeat('Alerta', 'Criminal') },
  { name: 'Sabio', feminine: 'Sabia', abilities: ['con', 'int', 'sab'], skills: ['arcanos', 'historia'], feat: originFeat('Iniciado en la magia', 'Sabio', 'mago') },
  { name: 'Soldado', abilities: ['fue', 'des', 'con'], skills: ['atletismo', 'intimidacion'], feat: originFeat('Atacante salvaje', 'Soldado') },
];

const proficiencyUses = (recovery: Uses['recovery']): Uses => ({ current: 2, max: 2, recovery });
/** Usos iguales al bonificador de competencia: 2 a nivel 1; se ajustan al subir de nivel. */
const byProficiency = 'Usos: tu bonificador de competencia (ajústalos al subir de nivel).';
const trait = (species: string, name: string, description: string, uses: Uses | null = null): Feature => ({ name, source: species, description, uses });
const darkvision = (species: string, meters: string, extra = '') =>
  trait(species, 'Visión en la oscuridad', `Ves en la penumbra a ${meters} como si hubiera luz brillante, y en la oscuridad como en penumbra, en tonos de gris.${extra}`);
const atLevel5 = 'Una vez por descanso largo. Cuando llegues a nivel 5, edita el rasgo y ponle 1 uso.';

export const speciesCatalog: Species[] = [
  {
    name: 'Dracónido', feminine: 'Dracónida', size: 'Mediano', speed: '9 m',
    traits: [
      trait('Dracónido', 'Ascendencia dracónida', 'Elige un dragón: decide el daño de tu Arma de aliento y tu resistencia. Negro o cobre: ácido. Azul o bronce: relámpago. Latón, oro o rojo: fuego. Verde: veneno. Blanco o plata: frío.'),
      trait('Dracónido', 'Arma de aliento', `Al hacer la acción de Ataque puedes cambiar un ataque por un aliento en cono de 4,5 m o en línea de 9 m (1,5 m de ancho). Quien esté en el área salva Destreza (CD 8 + Con + competencia): 1d10 del daño de tu ascendencia, la mitad si supera. Sube a 2d10 a nivel 5, 3d10 a 11 y 4d10 a 17. ${byProficiency}`, proficiencyUses('largo')),
      trait('Dracónido', 'Resistencia al daño', 'Resistencia al tipo de daño de tu ascendencia dracónida.'),
      darkvision('Dracónido', '18 m'),
      trait('Dracónido', 'Vuelo dracónido', `Desde nivel 5, como acción adicional te salen alas espectrales durante 10 minutos: ganas velocidad de vuelo igual a tu velocidad. ${atLevel5}`),
    ],
  },
  {
    name: 'Elfo', feminine: 'Elfa', size: 'Mediano', speed: '9 m',
    traits: [
      darkvision('Elfo', '18 m', ' Los drow la tienen a 36 m.'),
      trait('Elfo', 'Linaje élfico', 'Elige un linaje. Drow: visión en la oscuridad a 36 m y el truco Luces danzantes; a nivel 3, Fuego feérico, y a nivel 5, Oscuridad. Alto elfo: el truco Prestidigitación (puedes cambiarlo en cada descanso largo); a nivel 3, Detectar magia, y a nivel 5, Paso brumoso. Elfo de los bosques: velocidad 10,5 m (cámbiala en la ficha) y el truco Druidismo; a nivel 3, Zancada prodigiosa, y a nivel 5, Pasar sin rastro. Los conjuros de nivel 3 y 5 los lanzas una vez por descanso largo sin espacio, con Inteligencia, Sabiduría o Carisma.'),
      trait('Elfo', 'Ascendencia feérica', 'Ventaja en las salvaciones para evitar o terminar el estado encantado.'),
      trait('Elfo', 'Sentidos agudos', 'Competencia en Perspicacia, Percepción o Supervivencia, a tu elección (márcala en la ficha).'),
      trait('Elfo', 'Trance', 'No necesitas dormir y la magia no puede dormirte. Completas un descanso largo en 4 horas de meditación, sin perder la consciencia.'),
    ],
  },
  {
    name: 'Enano', feminine: 'Enana', size: 'Mediano', speed: '9 m',
    traits: [
      darkvision('Enano', '36 m'),
      trait('Enano', 'Resistencia enana', 'Resistencia al daño de veneno y ventaja en las salvaciones para evitar o terminar el estado envenenado.'),
      trait('Enano', 'Dureza enana', 'Tus PG máximos aumentan en 1 por cada nivel que tengas. La ficha no lo suma sola: añádelo a los PG al crear el personaje y al subir de nivel.'),
      trait('Enano', 'Conocimiento de la piedra', `Como acción adicional, ganas sentido sísmico a 18 m durante 10 minutos, siempre que estés sobre piedra o la toques. ${byProficiency}`, proficiencyUses('largo')),
    ],
  },
  {
    name: 'Gnomo', feminine: 'Gnoma', size: 'Pequeño', speed: '9 m',
    traits: [
      darkvision('Gnomo', '18 m'),
      trait('Gnomo', 'Astucia gnoma', 'Ventaja en las salvaciones de Inteligencia, Sabiduría y Carisma.'),
      trait('Gnomo', 'Linaje gnomo', 'Elige un linaje. Gnomo de los bosques: el truco Ilusión menor y siempre tienes preparado Hablar con los animales, que lanzas sin espacio tantas veces por descanso largo como tu bonificador de competencia. Gnomo de las rocas: los trucos Reparar y Prestidigitación, y con 10 minutos de trabajo creas un pequeño mecanismo de relojería. Lanzas estos conjuros con Inteligencia, Sabiduría o Carisma.'),
    ],
  },
  {
    name: 'Goliat', size: 'Mediano', speed: '10,5 m',
    traits: [
      trait('Goliat', 'Ascendencia gigante', `Elige un don. Salto de las nubes: como acción adicional te teletransportas hasta 9 m. Quemadura del fuego: al impactar, +1d10 de fuego. Escalofrío de la escarcha: al impactar, +1d6 de frío y el objetivo pierde 3 m de velocidad. Caída de la colina: al impactar, derribas a un objetivo Grande o menor. Aguante de la piedra: como reacción al recibir daño, lo reduces en 1d12 + Con. Trueno de la tormenta: como reacción al recibir daño de una criatura a 18 m, le haces 1d8 de trueno. ${byProficiency}`, proficiencyUses('largo')),
      trait('Goliat', 'Forma grande', `Desde nivel 5, como acción adicional pasas a tamaño Grande durante 10 minutos si hay espacio: ventaja en las pruebas de Fuerza y +3 m de velocidad. ${atLevel5}`),
      trait('Goliat', 'Complexión poderosa', 'Ventaja en las pruebas para librarte de un agarre, y cuentas como una talla más para la carga que puedes llevar.'),
    ],
  },
  {
    name: 'Humano', feminine: 'Humana', size: 'Mediano o Pequeño', speed: '9 m',
    traits: [
      trait('Humano', 'Ingenioso', 'Ganas Inspiración heroica al terminar cada descanso largo: este uso es esa inspiración. Gástalo para repetir una tirada de d20.', { current: 1, max: 1, recovery: 'largo' }),
      trait('Humano', 'Hábil', 'Competencia en una habilidad a tu elección (márcala en la ficha).'),
      trait('Humano', 'Versátil', 'Ganas una dote de origen a tu elección (añádela desde el listado de rasgos y dotes).'),
    ],
  },
  {
    name: 'Mediano', feminine: 'Mediana', size: 'Pequeño', speed: '9 m',
    traits: [
      trait('Mediano', 'Valiente', 'Ventaja en las salvaciones para evitar o terminar el estado asustado.'),
      trait('Mediano', 'Agilidad mediana', 'Puedes atravesar el espacio de cualquier criatura de un tamaño mayor que el tuyo, pero no detenerte en él.'),
      trait('Mediano', 'Suerte', 'Cuando sacas un 1 en el d20 de una prueba d20, puedes repetir la tirada y usar el nuevo resultado.'),
      trait('Mediano', 'Sigilo natural', 'Puedes hacer la acción de Esconderse aunque solo te tape una criatura al menos un tamaño mayor que tú.'),
    ],
  },
  {
    name: 'Orco', feminine: 'Orca', size: 'Mediano', speed: '9 m',
    traits: [
      trait('Orco', 'Descarga de adrenalina', `Como acción adicional haces la acción de Correr y ganas PG temporales iguales a tu bonificador de competencia. ${byProficiency} Se recuperan en descanso corto o largo.`, proficiencyUses('corto')),
      darkvision('Orco', '36 m'),
      trait('Orco', 'Aguante incansable', 'Cuando bajas a 0 PG sin morir en el acto, puedes quedarte a 1 PG. Una vez por descanso largo.', { current: 1, max: 1, recovery: 'largo' }),
    ],
  },
  {
    name: 'Tiflin', size: 'Mediano o Pequeño', speed: '9 m',
    traits: [
      darkvision('Tiflin', '18 m'),
      trait('Tiflin', 'Legado infernal', 'Elige un legado. Abisal: resistencia al veneno y el truco Rociada venenosa; a nivel 3, Rayo nauseabundo, y a nivel 5, Inmovilizar persona. Ctónico: resistencia al daño necrótico y el truco Toque helado; a nivel 3, Falsa vida, y a nivel 5, Rayo debilitador. Infernal: resistencia al fuego y el truco Rayo de fuego; a nivel 3, Reprensión infernal, y a nivel 5, Oscuridad. Los conjuros de nivel 3 y 5 los lanzas una vez por descanso largo sin espacio, con Inteligencia, Sabiduría o Carisma.'),
      trait('Tiflin', 'Presencia sobrenatural', 'Conoces el truco Taumaturgia y lo lanzas con la misma característica que tu Legado infernal.'),
    ],
  },
];

const byName = <T extends { name: string; feminine?: string }>(list: T[], name: string) => {
  const key = normalize(name.trim());
  return list.find((entry) => [entry.name, entry.feminine].some((n) => n !== undefined && normalize(n) === key));
};
/** Trasfondo del listado por su nombre (sin distinguir mayúsculas, tildes ni la forma femenina). */
export const findBackground = (name: string) => byName(backgroundCatalog, name);
/** Especie del listado por su nombre (sin distinguir mayúsculas, tildes ni la forma femenina). */
export const findSpecies = (name: string) => byName(speciesCatalog, name);
