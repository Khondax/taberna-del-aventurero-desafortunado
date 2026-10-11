# Fichas D&D 2024 - La Taberna del Aventurero Desafortunado

## Resumen

Crear una aplicación web en español para D&D 2024 (5.5e), centrada en fichas personales, creación guiada, subida de nivel, grimorio/inventario y consulta rápida durante la partida. Los jugadores comparten fichas concretas con su director mediante una mesa con invitación; el director consulta y deja notas privadas, sin editar personajes.

La interfaz seguirá el proyecto de Stitch “Gestor de Rol Medieval”: estética de manuscrito funcional, pergamino/granate/latón, EB Garamond para narrativa, Hanken Grotesk para lectura y JetBrains Mono para valores de juego.

## Implementación

- Base técnica: Astro + TypeScript + Tailwind, desplegado en Vercel; Supabase proporcionará PostgreSQL, autenticación por correo y contraseña, y políticas de acceso por fila.
- Entidades principales: usuario, mesa, invitación, ficha, progreso de nivel, recursos, inventario, conjuros, tiradas, notas de director y biblioteca de reglas por mesa.
- Crear el asistente de personaje de nivel 1: atributos por matriz estándar, compra de puntos o tiradas; especie, trasfondo, clase, equipo, conjuros y elección de opciones correspondientes. La ficha resultante seguirá siendo totalmente editable.
- Construir un asistente de subida de nivel que presente elecciones y mejoras derivadas de clase/subclase, las confirme y guarde un historial. El jugador podrá corregir cualquier resultado manualmente.
- Implementar la ficha en tres áreas: navegación de personajes/mesa, ficha activa con estadísticas y recursos, y panel contextual de rasgos, conjuros e inventario. En móvil, convertirlo en un flujo único con una barra de acciones rápidas.
- Añadir grimorio e inventario buscables, con detalle de reglas contextual; control de puntos de golpe, dados de golpe, espacios de conjuro y usos; tiradas rápidas con historial personal; y descansos corto/largo guiados, confirmables y reversibles.
- Normalizar el PDF aportado como biblioteca privada de reglas: clases, subclases, especies, trasfondos, dotes, equipo, objetos, conjuros y progresiones. Director y propietario de la mesa podrán crear o modificar contenido casero compartido.
- Exponer rutas protegidas para autenticación, fichas, mesas/invitaciones, biblioteca, recursos, tiradas y notas. Aplicar permisos: propietario edita su ficha; director invitado solo la lee y crea notas privadas; contenido de mesa solo lo modifica director/propietario.

## Pruebas

- Registro, inicio de sesión, creación de mesa, invitación y revocación de acceso.
- Restricciones de permisos: un director no puede editar fichas; un jugador no accede a otra mesa ni a notas privadas.
- Creación de personaje con los tres métodos de atributos y validación de elecciones requeridas.
- Subidas de nivel, edición posterior, historial y selección de conjuros/rasgos.
- Inventario, recursos, tiradas y descansos, incluyendo confirmación, reversión y valores límite.
- Búsqueda de biblioteca, contenido casero y adaptación visual/escalabilidad en escritorio y móvil.

## Suposiciones

- La v1 no administra encuentros, turnos ni progreso de campaña; las pantallas de director de Stitch se reducen a consulta de mesa y notas.
- Las reglas se limitan a D&D 2024 en español; excepciones y compatibilidad se modelan como contenido casero.
- El PDF se usará únicamente como fuente para la biblioteca privada de las mesas autorizadas, no como contenido público.
