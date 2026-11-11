// Conjuros de nivel 0 a 5 para añadir a la ficha. Basados en el SRD 5.2 de Wizards of
// the Coast (CC-BY-4.0); las descripciones son resúmenes propios, no el texto oficial.
import type { Spell } from '../lib/schema';

type Options = Partial<Pick<Spell, 'concentration' | 'ritual' | 'effect' | 'save' | 'attack' | 'higherLevels'>>;

const spell = (
  name: string,
  level: number,
  school: string,
  casting: string,
  range: string,
  components: string,
  duration: string,
  description: string,
  options: Options = {},
): Spell => ({
  name, level, school, casting, range, components, duration, description,
  concentration: false, ritual: false, effect: null, save: null, attack: false, higherLevels: '',
  ...options,
});
const fx = (dice: string, type: string, addModifier = false) => ({ dice, type, addModifier });
const A = '1 acción';
const AA = 'Acción adicional';
const R = 'Reacción';

export const spellCatalog: Spell[] = [
  // Trucos
  spell('Agarre electrizante', 0, 'Evocación', A, 'Toque', 'V, S', 'Instantánea', 'Ataque cuerpo a cuerpo con conjuro; si impacta, el objetivo no puede hacer ataques de oportunidad hasta el inicio de su siguiente turno.', { attack: true, effect: fx('1d8', 'relámpago') }),
  spell('Burla dañina', 0, 'Encantamiento', A, '18 m', 'V', 'Instantánea', 'Insultos cargados de magia. Si falla la salvación, sufre daño y tiene desventaja en su siguiente tirada de ataque.', { save: 'sab', effect: fx('1d6', 'psíquico') }),
  spell('Descarga sobrenatural', 0, 'Evocación', A, '36 m', 'V, S', 'Instantánea', 'Rayo de energía crepitante. A nivel 5, 11 y 17 lanzas más rayos (uno por cada dado), cada uno con su propio ataque.', { attack: true, effect: fx('1d10', 'fuerza') }),
  spell('Ilusión menor', 0, 'Ilusión', A, '9 m', 'S, M', '1 minuto', 'Creas un sonido o una imagen de un objeto que cabe en un cubo de 1,5 m. Una prueba de Investigación la revela.'),
  spell('Llama sagrada', 0, 'Evocación', A, '18 m', 'V, S', 'Instantánea', 'Fuego radiante desciende sobre el objetivo, que no se beneficia de la cobertura para esta salvación.', { save: 'des', effect: fx('1d8', 'radiante') }),
  spell('Luz', 0, 'Evocación', A, 'Toque', 'V, M', '1 hora', 'Un objeto emite luz brillante en 6 m y tenue 6 m más.'),
  spell('Mano de mago', 0, 'Conjuración', A, '9 m', 'V, S', '1 minuto', 'Una mano espectral manipula objetos de hasta 5 kg, abre puertas o recipientes. No puede atacar.'),
  spell('Mensaje', 0, 'Transmutación', A, '36 m', 'S, M', '1 asalto', 'Susurras un mensaje a una criatura, que puede responder en voz baja.'),
  spell('Orientación', 0, 'Adivinación', A, 'Toque', 'V, S', '1 minuto', 'Un aliado añade 1d4 a las pruebas de una habilidad que elijas mientras dure.', { concentration: true }),
  spell('Piedad con los moribundos', 0, 'Nigromancia', A, '4,5 m', 'V, S', 'Instantánea', 'Una criatura con 0 PG queda estabilizada.'),
  spell('Prestidigitación', 0, 'Transmutación', A, '3 m', 'V, S', 'Hasta 1 hora', 'Pequeños efectos mágicos: limpiar, ensuciar, encender una vela, dar sabor, crear una marca o una ilusión diminuta.'),
  spell('Producir llama', 0, 'Conjuración', AA, 'Uno mismo', 'V, S', '10 minutos', 'Una llama en tu mano da luz. Puedes arrojarla con un ataque a distancia de conjuro (18 m).', { attack: true, effect: fx('1d8', 'fuego') }),
  spell('Rayo de escarcha', 0, 'Evocación', A, '18 m', 'V, S', 'Instantánea', 'Si impacta, la velocidad del objetivo baja 3 m hasta el inicio de tu siguiente turno.', { attack: true, effect: fx('1d8', 'frío') }),
  spell('Rayo de fuego', 0, 'Evocación', A, '36 m', 'V, S', 'Instantánea', 'Lanzas una mota de fuego. Los objetos inflamables que nadie lleva encima prenden.', { attack: true, effect: fx('1d10', 'fuego') }),
  spell('Resistencia', 0, 'Abjuración', A, 'Toque', 'V, S', '1 minuto', 'Eliges un tipo de daño: una vez por turno, el aliado reduce en 1d4 el daño de ese tipo que recibe.', { concentration: true }),
  spell('Rociada venenosa', 0, 'Nigromancia', A, '9 m', 'V, S', 'Instantánea', 'Proyectas una nube tóxica con un ataque a distancia de conjuro.', { attack: true, effect: fx('1d12', 'veneno') }),
  spell('Taumaturgia', 0, 'Transmutación', A, '9 m', 'V', 'Hasta 1 minuto', 'Prodigios menores: voz atronadora, llamas que cambian, temblores leves, ojos que cambian de aspecto.'),
  spell('Toque helado', 0, 'Nigromancia', A, 'Toque', 'V, S', 'Instantánea', 'Ataque cuerpo a cuerpo con conjuro; el objetivo no puede recuperar PG hasta el final de tu siguiente turno.', { attack: true, effect: fx('1d10', 'necrótico') }),

  // Nivel 1
  spell('Alarma', 1, 'Abjuración', '1 minuto', '9 m', 'V, S, M', '8 horas', 'Proteges una zona; te avisa mental o audiblemente cuando entra una criatura no autorizada.', { ritual: true }),
  spell('Armadura de mago', 1, 'Abjuración', A, 'Toque', 'V, S, M', '8 horas', 'Una criatura sin armadura tiene CA base 13 + su modificador de Destreza.'),
  spell('Bendición', 1, 'Encantamiento', A, '9 m', 'V, S, M', '1 minuto', 'Hasta tres criaturas añaden 1d4 a sus tiradas de ataque y de salvación.', { concentration: true, higherLevels: '+1 criatura por cada nivel de espacio por encima del 1.' }),
  spell('Caída de pluma', 1, 'Transmutación', R, '18 m', 'V, M', '1 minuto', 'Hasta cinco criaturas que caen descienden despacio y no sufren daño por la caída.'),
  spell('Castigo divino', 1, 'Evocación', `${AA}, tras impactar`, 'Uno mismo', 'V', 'Instantánea', 'Al impactar con un arma, añades daño radiante; +1d8 contra infernales y muertos vivientes.', { effect: fx('2d8', 'radiante'), higherLevels: '+1d8 por cada nivel de espacio por encima del 1.' }),
  spell('Comprensión idiomática', 1, 'Adivinación', A, 'Uno mismo', 'V, S, M', '1 hora', 'Entiendes cualquier idioma hablado y escrito que percibas.', { ritual: true }),
  spell('Curar heridas', 1, 'Abjuración', A, 'Toque', 'V, S', 'Instantánea', 'Una criatura que tocas recupera PG.', { effect: fx('2d8', 'curación', true), higherLevels: '+2d8 por cada nivel de espacio por encima del 1.' }),
  spell('Detectar magia', 1, 'Adivinación', A, 'Uno mismo', 'V, S', '10 minutos', 'Percibes la magia a 9 m y puedes ver su aura y su escuela.', { concentration: true, ritual: true }),
  spell('Disfrazarse', 1, 'Ilusión', A, 'Uno mismo', 'V, S', '1 hora', 'Cambias tu aspecto, ropa y equipo con una ilusión. Una prueba de Investigación la descubre.'),
  spell('Dormir', 1, 'Encantamiento', A, '18 m', 'V, S, M', '1 minuto', 'Criaturas en una esfera de 1,5 m quedan incapacitadas y, si fallan otra vez, inconscientes.', { concentration: true, save: 'sab' }),
  spell('Encontrar familiar', 1, 'Conjuración', '1 hora', '3 m', 'V, S, M', 'Instantánea', 'Obtienes un espíritu familiar con forma de animal pequeño que te sirve y comparte sus sentidos contigo.', { ritual: true }),
  spell('Escudo', 1, 'Abjuración', R, 'Uno mismo', 'V, S', '1 asalto', '+5 a la CA hasta el inicio de tu siguiente turno, incluido el ataque que lo provocó. Inmune a Proyectil mágico.'),
  spell('Escudo de fe', 1, 'Abjuración', AA, '18 m', 'V, S, M', '10 minutos', 'Una criatura obtiene +2 a la CA.', { concentration: true }),
  spell('Grasa', 1, 'Conjuración', A, '18 m', 'V, S, M', '1 minuto', 'Cubres un cuadrado de 3 m de grasa; quien entra o empieza ahí salva o cae derribado.', { save: 'des' }),
  spell('Hechizar persona', 1, 'Encantamiento', A, '9 m', 'V, S', '1 hora', 'Un humanoide queda hechizado y te trata como a un conocido amistoso. Ventaja en la salvación si luchas contra él.', { save: 'sab', higherLevels: '+1 objetivo por cada nivel de espacio por encima del 1.' }),
  spell('Identificar', 1, 'Adivinación', '1 minuto', 'Toque', 'V, S, M', 'Instantánea', 'Conoces las propiedades, cargas y conjuros que afectan a un objeto o criatura.', { ritual: true }),
  spell('Infligir heridas', 1, 'Nigromancia', A, 'Toque', 'V, S', 'Instantánea', 'Energía necrótica al tocar; mitad de daño si supera la salvación.', { save: 'con', effect: fx('2d10', 'necrótico'), higherLevels: '+1d10 por cada nivel de espacio por encima del 1.' }),
  spell('Maleficio', 1, 'Encantamiento', AA, '27 m', 'V, S, M', '1 hora', 'Maldices a una criatura: sufre +1d6 necrótico cuando la impactas y desventaja en pruebas de una característica.', { concentration: true, effect: fx('1d6', 'necrótico') }),
  spell('Manos ardientes', 1, 'Evocación', A, 'Uno mismo (cono de 4,5 m)', 'V, S', 'Instantánea', 'Un abanico de llamas; mitad de daño si supera la salvación.', { save: 'des', effect: fx('3d6', 'fuego'), higherLevels: '+1d6 por cada nivel de espacio por encima del 1.' }),
  spell('Marca del cazador', 1, 'Adivinación', AA, '27 m', 'V', '1 hora', 'Marcas a una criatura: +1d6 de fuerza cuando la impactas y ventaja para encontrarla con Percepción o Supervivencia.', { concentration: true, effect: fx('1d6', 'fuerza') }),
  spell('Nube de oscurecimiento', 1, 'Conjuración', A, '36 m', 'V, S', '1 hora', 'Una esfera de niebla de 6 m de radio que oscurece por completo la zona.', { concentration: true }),
  spell('Onda atronadora', 1, 'Evocación', A, 'Uno mismo (cubo de 4,5 m)', 'V, S', 'Instantánea', 'Una onda de fuerza empuja 3 m a quien falla; mitad de daño y sin empuje si supera.', { save: 'con', effect: fx('2d8', 'trueno'), higherLevels: '+1d8 por cada nivel de espacio por encima del 1.' }),
  spell('Palabra de curación', 1, 'Abjuración', AA, '18 m', 'V', 'Instantánea', 'Una criatura que ves recupera PG.', { effect: fx('2d4', 'curación', true), higherLevels: '+2d4 por cada nivel de espacio por encima del 1.' }),
  spell('Proyectil mágico', 1, 'Evocación', A, '36 m', 'V, S', 'Instantánea', 'Tres dardos que impactan siempre; cada uno hace 1d4 + 1 y puedes repartirlos entre objetivos.', { effect: fx('3d4+3', 'fuerza'), higherLevels: '+1 dardo por cada nivel de espacio por encima del 1.' }),
  spell('Rayo guía', 1, 'Evocación', A, '36 m', 'V, S', '1 asalto', 'Si impacta, la siguiente tirada de ataque contra el objetivo antes de tu próximo turno tiene ventaja.', { attack: true, effect: fx('4d6', 'radiante'), higherLevels: '+1d6 por cada nivel de espacio por encima del 1.' }),
  spell('Risa horrible', 1, 'Encantamiento', A, '9 m', 'V, S, M', '1 minuto', 'El objetivo cae derribado e incapacitado por la risa. Repite la salvación al final de sus turnos y al recibir daño.', { concentration: true, save: 'sab' }),
  spell('Santuario', 1, 'Abjuración', AA, '9 m', 'V, S, M', '1 minuto', 'Quien quiera atacar a la criatura protegida debe salvar o elegir otro objetivo. Termina si ella ataca.'),

  // Nivel 2
  spell('Apertura', 2, 'Transmutación', A, '18 m', 'V', 'Instantánea', 'Abres una cerradura, cerrojo o grillete mundano; los mágicos se suprimen 10 minutos. Suena un golpe fuerte.'),
  spell('Arma espiritual', 2, 'Evocación', AA, '18 m', 'V, S', '1 minuto', 'Un arma espectral ataca cuerpo a cuerpo con conjuro; como acción adicional puedes moverla 6 m y volver a atacar.', { concentration: true, attack: true, effect: fx('1d8', 'fuerza', true), higherLevels: '+1d8 por cada nivel de espacio por encima del 2.' }),
  spell('Ayuda', 2, 'Abjuración', A, '9 m', 'V, S, M', '8 horas', 'Hasta tres criaturas aumentan sus PG máximos y actuales en 5.', { higherLevels: '+5 PG por cada nivel de espacio por encima del 2.' }),
  spell('Calentar metal', 2, 'Transmutación', A, '18 m', 'V, S, M', '1 minuto', 'Un objeto metálico se pone al rojo. Quien lo toca sufre daño y salva o lo suelta; puedes repetir el daño como acción adicional.', { concentration: true, save: 'con', effect: fx('2d8', 'fuego'), higherLevels: '+1d8 por cada nivel de espacio por encima del 2.' }),
  spell('Detectar pensamientos', 2, 'Adivinación', A, 'Uno mismo', 'V, S, M', '1 minuto', 'Lees los pensamientos superficiales de una criatura; puedes intentar sondear más a fondo.', { concentration: true, save: 'sab' }),
  spell('Esfera flamígera', 2, 'Conjuración', A, '18 m', 'V, S, M', '1 minuto', 'Una esfera de fuego de 1,5 m que puedes mover como acción adicional; quema a quien termina a su lado.', { concentration: true, save: 'des', effect: fx('2d6', 'fuego'), higherLevels: '+1d6 por cada nivel de espacio por encima del 2.' }),
  spell('Imagen múltiple', 2, 'Ilusión', A, 'Uno mismo', 'V, S', '1 minuto', 'Tres duplicados ilusorios; cada ataque contra ti puede impactar a uno de ellos y destruirlo.'),
  spell('Invisibilidad', 2, 'Ilusión', A, 'Toque', 'V, S, M', '1 hora', 'Una criatura se vuelve invisible hasta que ataca, causa daño o lanza un conjuro.', { concentration: true, higherLevels: '+1 objetivo por cada nivel de espacio por encima del 2.' }),
  spell('Oscuridad', 2, 'Evocación', A, '18 m', 'V, M', '10 minutos', 'Oscuridad mágica en una esfera de 4,5 m de radio; la visión en la oscuridad no la atraviesa.', { concentration: true }),
  spell('Pasar sin rastro', 2, 'Abjuración', A, 'Uno mismo', 'V, S, M', '1 hora', 'Tú y tus aliados a 9 m tenéis +10 a Sigilo y no dejáis rastro.', { concentration: true }),
  spell('Paso brumoso', 2, 'Conjuración', AA, 'Uno mismo', 'V', 'Instantánea', 'Te teletransportas hasta 9 m a un espacio que puedas ver.'),
  spell('Plegaria de curación', 2, 'Abjuración', '10 minutos', '9 m', 'V', 'Instantánea', 'Hasta cinco criaturas recuperan PG y obtienen los beneficios de un descanso corto.', { effect: fx('2d8', 'curación', true), higherLevels: '+1d8 por cada nivel de espacio por encima del 2.' }),
  spell('Potenciar característica', 2, 'Transmutación', A, 'Toque', 'V, S, M', '1 hora', 'Una criatura tiene ventaja en las pruebas de la característica que elijas.', { concentration: true, higherLevels: '+1 objetivo por cada nivel de espacio por encima del 2.' }),
  spell('Rayo abrasador', 2, 'Evocación', A, '36 m', 'V, S', 'Instantánea', 'Tres rayos de fuego, cada uno con su propio ataque a distancia de conjuro (daño por rayo).', { attack: true, effect: fx('2d6', 'fuego'), higherLevels: '+1 rayo por cada nivel de espacio por encima del 2.' }),
  spell('Restablecimiento menor', 2, 'Abjuración', AA, 'Toque', 'V, S', 'Instantánea', 'Terminas los estados cegado, ensordecido, paralizado o envenenado de una criatura.'),
  spell('Silencio', 2, 'Ilusión', A, '36 m', 'V, S', '10 minutos', 'Ningún sonido entra ni sale de una esfera de 6 m; impide los componentes verbales.', { concentration: true, ritual: true }),
  spell('Sugestión', 2, 'Encantamiento', A, '9 m', 'V, M', '8 horas', 'Sugieres un curso de acción razonable y el objetivo lo sigue si falla.', { concentration: true, save: 'sab' }),
  spell('Sujetar persona', 2, 'Encantamiento', A, '18 m', 'V, S, M', '1 minuto', 'Un humanoide queda paralizado; repite la salvación al final de cada uno de sus turnos.', { concentration: true, save: 'sab', higherLevels: '+1 humanoide por cada nivel de espacio por encima del 2.' }),
  spell('Telaraña', 2, 'Conjuración', A, '18 m', 'V, S, M', '1 hora', 'Telarañas en un cubo de 6 m: terreno difícil y quien falla queda apresado.', { concentration: true, save: 'des' }),
  spell('Ver invisibilidad', 2, 'Adivinación', A, 'Uno mismo', 'V, S, M', '1 hora', 'Ves criaturas y objetos invisibles y en el Plano Etéreo.'),

  // Nivel 3
  spell('Acelerar', 3, 'Transmutación', A, '9 m', 'V, S, M', '1 minuto', 'Una criatura dobla su velocidad, gana +2 a la CA, ventaja en salvaciones de Destreza y una acción extra limitada. Al terminar, pierde un turno.', { concentration: true }),
  spell('Animar a los muertos', 3, 'Nigromancia', '1 minuto', '3 m', 'V, S, M', 'Instantánea', 'Conviertes un cadáver en esqueleto o zombi bajo tu control durante 24 horas.'),
  spell('Bola de fuego', 3, 'Evocación', A, '45 m', 'V, S, M', 'Instantánea', 'Explosión en una esfera de 6 m de radio; mitad de daño si supera la salvación.', { save: 'des', effect: fx('8d6', 'fuego'), higherLevels: '+1d6 por cada nivel de espacio por encima del 3.' }),
  spell('Contrahechizo', 3, 'Abjuración', R, '18 m', 'S', 'Instantánea', 'Interrumpes a quien lanza un conjuro: si falla la salvación, el conjuro se disipa y no gasta el espacio.', { save: 'con' }),
  spell('Disipar magia', 3, 'Abjuración', A, '36 m', 'V, S', 'Instantánea', 'Terminas los conjuros de nivel 3 o menos sobre un objetivo; los de nivel superior requieren una prueba de tu aptitud mágica (CD 10 + nivel).', { higherLevels: 'Terminas automáticamente conjuros de nivel igual o inferior al espacio usado.' }),
  spell('Espíritus guardianes', 3, 'Conjuración', A, 'Uno mismo (emanación de 4,5 m)', 'V, S, M', '10 minutos', 'Espíritus a tu alrededor: los enemigos van a mitad de velocidad y sufren daño radiante o necrótico (mitad si superan).', { concentration: true, save: 'sab', effect: fx('3d8', 'radiante o necrótico'), higherLevels: '+1d8 por cada nivel de espacio por encima del 3.' }),
  spell('Imponer maldición', 3, 'Nigromancia', A, 'Toque', 'V, S', '1 minuto', 'Eliges una maldición: desventaja en una característica, perder turnos, daño extra de tus ataques…', { concentration: true, save: 'sab' }),
  spell('Levantar maldición', 3, 'Abjuración', A, 'Toque', 'V, S', 'Instantánea', 'Terminas todas las maldiciones que afectan a una criatura u objeto.'),
  spell('Llamar al relámpago', 3, 'Conjuración', A, '36 m', 'V, S', '10 minutos', 'Una nube de tormenta: cada turno puedes hacer caer un rayo en un punto (mitad si superan).', { concentration: true, save: 'des', effect: fx('3d10', 'relámpago'), higherLevels: '+1d10 por cada nivel de espacio por encima del 3.' }),
  spell('Luz del día', 3, 'Evocación', A, '18 m', 'V, S', '1 hora', 'Una esfera de luz brillante de 18 m de radio que disipa la oscuridad mágica de nivel 3 o menos.'),
  spell('Miedo', 3, 'Ilusión', A, 'Uno mismo (cono de 9 m)', 'V, S, M', '1 minuto', 'Las criaturas que fallan sueltan lo que llevan, quedan asustadas y huyen de ti.', { concentration: true, save: 'sab' }),
  spell('Palabra de curación en masa', 3, 'Abjuración', AA, '18 m', 'V', 'Instantánea', 'Hasta seis criaturas que ves recuperan PG.', { effect: fx('2d4', 'curación', true) }),
  spell('Patrón hipnótico', 3, 'Ilusión', A, '36 m', 'S, M', '1 minuto', 'Un patrón de colores en un cubo de 9 m: quien falla queda hechizado e incapacitado.', { concentration: true, save: 'sab' }),
  spell('Protección contra la energía', 3, 'Abjuración', A, 'Toque', 'V, S', '1 hora', 'Una criatura obtiene resistencia a ácido, frío, fuego, relámpago o trueno.', { concentration: true }),
  spell('Relámpago', 3, 'Evocación', A, 'Uno mismo (línea de 30 m)', 'V, S, M', 'Instantánea', 'Una línea de 30 m por 1,5 m; mitad de daño si supera la salvación.', { save: 'des', effect: fx('8d6', 'relámpago'), higherLevels: '+1d6 por cada nivel de espacio por encima del 3.' }),
  spell('Respirar bajo el agua', 3, 'Transmutación', A, '9 m', 'V, S, M', '24 horas', 'Hasta diez criaturas pueden respirar bajo el agua.', { ritual: true }),
  spell('Revivificar', 3, 'Nigromancia', A, 'Toque', 'V, S, M (diamante de 300 po)', 'Instantánea', 'Una criatura muerta hace menos de 1 minuto vuelve a la vida con 1 PG.'),
  spell('Señal de esperanza', 3, 'Abjuración', A, '9 m', 'V, S', '1 minuto', 'Tus aliados tienen ventaja en salvaciones de Sabiduría y contra muerte, y recuperan el máximo posible al curarse.', { concentration: true }),
  spell('Lentitud', 3, 'Transmutación', A, '36 m', 'V, S, M', '1 minuto', 'Hasta seis criaturas: mitad de velocidad, −2 a la CA y a salvaciones de Destreza, y acciones limitadas.', { concentration: true, save: 'sab' }),
  spell('Volar', 3, 'Transmutación', A, 'Toque', 'V, S, M', '10 minutos', 'Una criatura obtiene velocidad de vuelo de 18 m.', { concentration: true, higherLevels: '+1 objetivo por cada nivel de espacio por encima del 3.' }),

  // Nivel 4
  spell('Destierro', 4, 'Abjuración', A, '18 m', 'V, S, M', '1 minuto', 'El objetivo queda desterrado a un semiplano inofensivo; si es de otro plano y dura todo el conjuro, no vuelve.', { concentration: true, save: 'car' }),
  spell('Guardián de la fe', 4, 'Conjuración', A, '9 m', 'V', '8 horas', 'Un guardián espectral daña a los enemigos que se acercan (mitad si superan), hasta 60 de daño en total.', { save: 'des', effect: fx('20', 'radiante') }),
  spell('Invisibilidad mayor', 4, 'Ilusión', A, 'Toque', 'V, S', '1 minuto', 'Una criatura es invisible aunque ataque o lance conjuros.', { concentration: true }),
  spell('Libertad de movimiento', 4, 'Abjuración', A, 'Toque', 'V, S, M', '1 hora', 'El terreno difícil, los conjuros y la magia no reducen la velocidad del objetivo ni lo paralizan o apresan.'),
  spell('Muro de fuego', 4, 'Evocación', A, '36 m', 'V, S, M', '1 minuto', 'Un muro de llamas; un lado quema a quien está cerca o lo atraviesa (mitad si supera).', { concentration: true, save: 'des', effect: fx('5d8', 'fuego'), higherLevels: '+1d8 por cada nivel de espacio por encima del 4.' }),
  spell('Polimorfar', 4, 'Transmutación', A, '18 m', 'V, S, M', '1 hora', 'Transformas a una criatura en una bestia de valor de desafío igual o inferior a su nivel.', { concentration: true, save: 'sab' }),
  spell('Puerta dimensional', 4, 'Conjuración', A, '150 m', 'V', 'Instantánea', 'Te teletransportas hasta 150 m, con una criatura voluntaria si quieres.'),
  spell('Tormenta de hielo', 4, 'Evocación', A, '90 m', 'V, S, M', 'Instantánea', 'Granizo en un cilindro de 6 m: 2d10 contundente y 4d6 frío, mitad si supera. El suelo queda resbaladizo.', { save: 'des', effect: fx('2d10', 'contundente (+4d6 frío)'), higherLevels: '+1d10 contundente por cada nivel de espacio por encima del 4.' }),

  // Nivel 5
  spell('Cono de frío', 5, 'Evocación', A, 'Uno mismo (cono de 18 m)', 'V, S, M', 'Instantánea', 'Una ráfaga helada; mitad de daño si supera la salvación.', { save: 'con', effect: fx('8d8', 'frío'), higherLevels: '+1d8 por cada nivel de espacio por encima del 5.' }),
  spell('Curar heridas en masa', 5, 'Abjuración', A, '18 m', 'V, S', 'Instantánea', 'Hasta seis criaturas en una esfera de 9 m recuperan PG.', { effect: fx('5d8', 'curación', true), higherLevels: '+1d8 por cada nivel de espacio por encima del 5.' }),
  spell('Golpe flamígero', 5, 'Evocación', A, '18 m', 'V, S, M', 'Instantánea', 'Columna de fuego divino: 5d6 fuego y 5d6 radiante, mitad si supera.', { save: 'des', effect: fx('5d6', 'fuego (+5d6 radiante)'), higherLevels: '+1d6 fuego y +1d6 radiante por nivel por encima del 5.' }),
  spell('Revivir a los muertos', 5, 'Nigromancia', '1 hora', 'Toque', 'V, S, M (diamante de 500 po)', 'Instantánea', 'Devuelves la vida a una criatura muerta hace menos de 10 días, con penalizaciones que se reducen al descansar.'),
  spell('Sujetar monstruo', 5, 'Encantamiento', A, '27 m', 'V, S, M', '1 minuto', 'Una criatura queda paralizada; repite la salvación al final de cada uno de sus turnos.', { concentration: true, save: 'sab', higherLevels: '+1 criatura por cada nivel de espacio por encima del 5.' }),
];
