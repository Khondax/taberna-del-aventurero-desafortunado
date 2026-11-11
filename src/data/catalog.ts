// Listados para añadir a la ficha: armas, objetos y dotes. Basados en el SRD 5.2 de
// Wizards of the Coast (CC-BY-4.0); las descripciones son resúmenes propios.
// Al añadir una entrada se copia a la ficha, donde se puede editar sin afectar al listado.
import type { Feature, InventoryItem, Weapon } from '../lib/schema';

function weapon(
  name: string,
  category: Weapon['category'],
  ranged: boolean,
  damage: string,
  damageType: string,
  properties: string[],
  mastery: string,
  weightKg: number,
): Weapon {
  const versatile = properties.join(' ').match(/Versátil \((\d+d\d+)\)/)?.[1] ?? '';
  const range = properties.join(' ').match(/\((\d[\d,]*\/\d[\d,]* m)\)/)?.[1] ?? '';
  return { name, category, ranged, damage, damageType, versatile, properties, range, mastery, proficient: false, magicBonus: 0, weightKg, description: '' };
}

export const weaponCatalog: Weapon[] = [
  // Sencillas cuerpo a cuerpo
  weapon('Bastón', 'sencilla', false, '1d6', 'contundente', ['Versátil (1d8)'], 'Derribar', 2),
  weapon('Daga', 'sencilla', false, '1d4', 'perforante', ['Sutil', 'Ligera', 'Arrojadiza (6/18 m)'], 'Mellar', 0.5),
  weapon('Garrote', 'sencilla', false, '1d4', 'contundente', ['Ligera'], 'Ralentizar', 1),
  weapon('Gran garrote', 'sencilla', false, '1d8', 'contundente', ['A dos manos'], 'Empujar', 5),
  weapon('Hacha de mano', 'sencilla', false, '1d6', 'cortante', ['Ligera', 'Arrojadiza (6/18 m)'], 'Hostigar', 1),
  weapon('Hoz', 'sencilla', false, '1d4', 'cortante', ['Ligera'], 'Mellar', 1),
  weapon('Jabalina', 'sencilla', false, '1d6', 'perforante', ['Arrojadiza (9/36 m)'], 'Ralentizar', 1),
  weapon('Lanza', 'sencilla', false, '1d6', 'perforante', ['Arrojadiza (6/18 m)', 'Versátil (1d8)'], 'Debilitar', 1.5),
  weapon('Martillo ligero', 'sencilla', false, '1d4', 'contundente', ['Ligera', 'Arrojadiza (6/18 m)'], 'Mellar', 1),
  weapon('Maza', 'sencilla', false, '1d6', 'contundente', [], 'Debilitar', 2),
  // Sencillas a distancia
  weapon('Arco corto', 'sencilla', true, '1d6', 'perforante', ['Munición (24/96 m)', 'A dos manos'], 'Hostigar', 1),
  weapon('Ballesta ligera', 'sencilla', true, '1d8', 'perforante', ['Munición (24/96 m)', 'Carga', 'A dos manos'], 'Ralentizar', 2.5),
  weapon('Dardo', 'sencilla', true, '1d4', 'perforante', ['Sutil', 'Arrojadiza (6/18 m)'], 'Hostigar', 0.125),
  weapon('Honda', 'sencilla', true, '1d4', 'contundente', ['Munición (9/36 m)'], 'Ralentizar', 0),
  // Marciales cuerpo a cuerpo
  weapon('Alabarda', 'marcial', false, '1d10', 'cortante', ['Pesada', 'Alcance', 'A dos manos'], 'Hendir', 3),
  weapon('Cimitarra', 'marcial', false, '1d6', 'cortante', ['Sutil', 'Ligera'], 'Mellar', 1.5),
  weapon('Espada corta', 'marcial', false, '1d6', 'perforante', ['Sutil', 'Ligera'], 'Hostigar', 1),
  weapon('Espada larga', 'marcial', false, '1d8', 'cortante', ['Versátil (1d10)'], 'Debilitar', 1.5),
  weapon('Espadón', 'marcial', false, '2d6', 'cortante', ['Pesada', 'A dos manos'], 'Rozar', 3),
  weapon('Estoque', 'marcial', false, '1d8', 'perforante', ['Sutil'], 'Hostigar', 1),
  weapon('Gran hacha', 'marcial', false, '1d12', 'cortante', ['Pesada', 'A dos manos'], 'Hendir', 3.5),
  weapon('Guja', 'marcial', false, '1d10', 'cortante', ['Pesada', 'Alcance', 'A dos manos'], 'Rozar', 3),
  weapon('Hacha de batalla', 'marcial', false, '1d8', 'cortante', ['Versátil (1d10)'], 'Derribar', 2),
  weapon('Lanza de caballería', 'marcial', false, '1d10', 'perforante', ['Pesada', 'Alcance', 'A dos manos (salvo montado)'], 'Derribar', 3),
  weapon('Látigo', 'marcial', false, '1d4', 'cortante', ['Sutil', 'Alcance'], 'Ralentizar', 1.5),
  weapon('Lucero del alba', 'marcial', false, '1d8', 'perforante', [], 'Debilitar', 2),
  weapon('Mangual', 'marcial', false, '1d8', 'contundente', [], 'Debilitar', 1),
  weapon('Martillo de guerra', 'marcial', false, '1d8', 'contundente', ['Versátil (1d10)'], 'Empujar', 2.5),
  weapon('Mazo', 'marcial', false, '2d6', 'contundente', ['Pesada', 'A dos manos'], 'Derribar', 5),
  weapon('Pica', 'marcial', false, '1d10', 'perforante', ['Pesada', 'Alcance', 'A dos manos'], 'Empujar', 9),
  weapon('Pico de guerra', 'marcial', false, '1d8', 'perforante', ['Versátil (1d10)'], 'Debilitar', 1),
  weapon('Tridente', 'marcial', false, '1d8', 'perforante', ['Arrojadiza (6/18 m)', 'Versátil (1d10)'], 'Derribar', 2),
  // Marciales a distancia
  weapon('Arco largo', 'marcial', true, '1d8', 'perforante', ['Munición (45/180 m)', 'Pesada', 'A dos manos'], 'Ralentizar', 1),
  weapon('Ballesta de mano', 'marcial', true, '1d6', 'perforante', ['Munición (9/36 m)', 'Ligera', 'Carga'], 'Hostigar', 1.5),
  weapon('Ballesta pesada', 'marcial', true, '1d10', 'perforante', ['Munición (30/120 m)', 'Pesada', 'Carga', 'A dos manos'], 'Empujar', 9),
  weapon('Cerbatana', 'marcial', true, '1', 'perforante', ['Munición (7,5/30 m)', 'Carga'], 'Hostigar', 0.5),
  weapon('Mosquete', 'marcial', true, '1d12', 'perforante', ['Munición (12/36 m)', 'Carga', 'A dos manos'], 'Ralentizar', 5),
  weapon('Pistola', 'marcial', true, '1d10', 'perforante', ['Munición (9/27 m)', 'Carga'], 'Hostigar', 1.5),
];

const item = (name: string, kind: string, weightKg: number, description: string, uses: InventoryItem['uses'] = null): InventoryItem => ({
  name,
  kind,
  quantity: 1,
  weightKg,
  description,
  uses,
});

export const itemCatalog: InventoryItem[] = [
  // Armaduras
  item('Armadura acolchada', 'Armadura ligera · CA 11 + Des', 4, 'Capas de tela acolchada. Desventaja en Sigilo.'),
  item('Armadura de cuero', 'Armadura ligera · CA 11 + Des', 5, 'Peto y hombreras de cuero endurecido.'),
  item('Cuero tachonado', 'Armadura ligera · CA 12 + Des', 6.5, 'Cuero reforzado con remaches metálicos.'),
  item('Armadura de pieles', 'Armadura intermedia · CA 12 + Des (máx. 2)', 6, 'Pieles gruesas y pelaje.'),
  item('Camisote de mallas', 'Armadura intermedia · CA 13 + Des (máx. 2)', 10, 'Anillas entrelazadas bajo la ropa.'),
  item('Cota de escamas', 'Armadura intermedia · CA 14 + Des (máx. 2)', 22.5, 'Escamas metálicas sobre cuero. Desventaja en Sigilo.'),
  item('Coraza', 'Armadura intermedia · CA 14 + Des (máx. 2)', 10, 'Peto metálico ajustado con cuero flexible.'),
  item('Media armadura', 'Armadura intermedia · CA 15 + Des (máx. 2)', 20, 'Placas sobre las zonas vitales. Desventaja en Sigilo.'),
  item('Cota de anillas', 'Armadura pesada · CA 14', 20, 'Anillas cosidas sobre cuero. Desventaja en Sigilo.'),
  item('Cota de mallas', 'Armadura pesada · CA 16', 27.5, 'Malla completa con acolchado. Requiere Fue 13. Desventaja en Sigilo.'),
  item('Armadura de bandas', 'Armadura pesada · CA 17', 30, 'Tiras metálicas verticales. Requiere Fue 15. Desventaja en Sigilo.'),
  item('Armadura de placas', 'Armadura pesada · CA 18', 32.5, 'Placas articuladas que cubren todo el cuerpo. Requiere Fue 15. Desventaja en Sigilo.'),
  item('Escudo', 'Escudo · +2 CA', 3, 'Se lleva en una mano y suma 2 a la CA.'),
  // Equipo
  item('Aceite (frasco)', 'Equipo', 0.5, 'Combustible para lámparas; también se puede arrojar y prender.'),
  item('Antorcha', 'Equipo', 0.5, 'Arde 1 hora con luz brillante a 6 m y tenue 6 m más.'),
  item('Bolsa de componentes', 'Foco arcano', 1, 'Sustituye a los componentes materiales sin coste indicado.'),
  item('Cuerda de cáñamo (15 m)', 'Equipo', 2.5, 'Se puede atar con una prueba de Destreza (Juego de manos).'),
  item('Flechas (20)', 'Munición', 0.5, 'Munición para arcos.'),
  item('Herramientas de ladrón', 'Herramientas', 0.5, 'Ganzúas y limas para abrir cerraduras y desactivar trampas.'),
  item('Libro de conjuros', 'Equipo', 1.5, 'Contiene los conjuros de mago que conoces.'),
  item('Mochila', 'Equipo', 2.5, 'Capacidad para unos 30 kg de equipo.'),
  item('Odre', 'Equipo', 2.5, 'Contiene 2 litros de líquido.'),
  item('Orbe (foco arcano)', 'Foco arcano', 1.5, 'Esfera de cristal para canalizar conjuros arcanos.'),
  item('Palanca', 'Equipo', 2.5, 'Ventaja en pruebas de Fuerza donde la palanca ayude.'),
  item('Raciones (1 día)', 'Provisiones', 1, 'Comida seca para un día.'),
  item('Saco de dormir', 'Equipo', 3.5, 'Para descansar al raso.'),
  item('Símbolo sagrado', 'Foco divino', 0.5, 'Amuleto, emblema o relicario para canalizar conjuros divinos.'),
  item('Útiles de sanador', 'Herramientas', 1.5, 'Estabilizan a una criatura con 0 PG sin prueba de Medicina.', { current: 10, max: 10, recovery: 'ninguna' }),
  item('Virotes (20)', 'Munición', 0.75, 'Munición para ballestas.'),
  item('Yesquero', 'Equipo', 0.5, 'Pedernal y yesca para encender fuego.'),
  // Consumibles y objetos mágicos
  item('Agua bendita', 'Consumible', 0.5, 'Arrojada: 2d8 radiante a infernales o muertos vivientes (salvación Des).'),
  item('Antitoxina', 'Consumible', 0, 'Ventaja contra el estado envenenado durante 1 hora.'),
  item('Fuego de alquimista', 'Consumible', 0.5, 'Arrojado: 1d4 fuego al inicio de cada turno hasta apagarlo (salvación Des).'),
  item('Poción de curación', 'Poción', 0.25, 'Recuperas 2d4 + 2 PG al beberla.'),
  item('Poción de curación mayor', 'Poción', 0.25, 'Recuperas 4d4 + 4 PG al beberla.'),
  item('Varita de proyectiles mágicos', 'Objeto maravilloso', 0.5, 'Gasta 1 carga para lanzar Proyectil mágico (+1 nivel por carga extra). Recupera 1d6 + 1 cargas al amanecer.', { current: 7, max: 7, recovery: 'largo' }),
];

const feat = (name: string, source: string, description: string, uses: Feature['uses'] = null): Feature => ({ name, source, description, uses });

export const featureCatalog: Feature[] = [
  feat('Alerta', 'Dote de origen', 'Sumas tu bonificador de competencia a la iniciativa y puedes intercambiar tu iniciativa con un aliado voluntario.'),
  feat('Atacante salvaje', 'Dote de origen', 'Una vez por turno, al impactar con un arma puedes tirar dos veces los dados de daño y quedarte el mejor resultado.'),
  feat('Habilidoso', 'Dote de origen', 'Ganas competencia en tres habilidades o herramientas a tu elección.'),
  feat('Iniciado en la magia', 'Dote de origen', 'Aprendes dos trucos y un conjuro de nivel 1 de una lista; puedes lanzar ese conjuro una vez sin espacio.', { current: 1, max: 1, recovery: 'largo' }),
  feat('Duro', 'Dote de origen', 'Tus PG máximos aumentan en el doble de tu nivel, y 2 más por cada nivel que subas.'),
  feat('Mejora de característica', 'Dote general', 'Aumenta una puntuación en 2 o dos puntuaciones en 1 (máximo 20).'),
  feat('Agarrador', 'Dote general', 'Ventaja al atacar a quien tienes agarrado y puedes moverlo sin coste extra de movimiento.'),
  feat('Estilo de combate: Arquería', 'Estilo de combate', '+2 a las tiradas de ataque con armas a distancia.'),
  feat('Estilo de combate: Defensa', 'Estilo de combate', '+1 a la CA mientras llevas armadura.'),
  feat('Estilo de combate: Armas grandes', 'Estilo de combate', 'Con armas a dos manos o versátiles, los 1 y 2 en los dados de daño cuentan como 3.'),
  feat('Estilo de combate: Dos armas', 'Estilo de combate', 'Sumas tu modificador al daño del ataque adicional con un arma Ligera.'),
  feat('Inspiración heroica', 'Regla', 'Puedes gastarla para repetir cualquier tirada de d20 y quedarte el nuevo resultado.', { current: 1, max: 1, recovery: 'ninguna' }),
];
