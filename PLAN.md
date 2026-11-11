# Fichas D&D 2024 - La Taberna del Aventurero Desafortunado

## Resumen

Aplicación web en español para una partida de D&D 2024 (5.5e) entre amigos. Se centra en la consulta y el seguimiento durante la sesión: fichas, recursos, grimorio, inventario, descansos y subida de nivel. Las fichas son públicas dentro de la mesa y el máster tiene una vista con el resumen de todas. No hay cuentas ni roles.

La interfaz sigue el proyecto de Stitch “Gestor de Rol Medieval”: estética de manuscrito funcional, pergamino/granate/latón, EB Garamond para narrativa, Hanken Grotesk para lectura y JetBrains Mono para valores de juego.

## Decisiones

- Astro con `@astrojs/node`, servido desde mint-node solo por red local o Tailscale.
- Persistencia en un archivo JSON por personaje, sin base de datos. El formato de exportación es el mismo que el de disco.
- Sin autenticación: puede editar cualquiera con acceso a la red. Si algún día se expone fuera, habrá que añadir al menos una contraseña de mesa.
- JavaScript sin framework en cliente. Si la ficha crece mucho en interactividad, valorar un componente Svelte para ella.

## Hecho

- Vista del máster con refresco automático e importación.
- Ficha editable en el sitio: identidad, nivel, PX, características, CA, velocidad, PG, dados de golpe, competencias en salvaciones y habilidades, aptitud mágica y espacios.
- Armas, conjuros, objetos y rasgos desde los listados del SRD 5.2 o personalizados, con diálogo de edición y tooltip con desglose de cada número.
- Tiradas de características, salvaciones, habilidades, ataques y conjuros. Recursos, descansos, subida de nivel, deshacer, exportación y guardado automático con detección de conflictos.
- Formato v3 con migración automática desde v1 y v2.
- Listados con conjuros de nivel 0 a 9 y los rasgos de clase principales de 2024, filtrables por clase.
- CA calculada desde la armadura y el escudo equipados, con Defensa sin armadura de bárbaro y monje.
- Espacios al subir de nivel con las tablas de lanzador completo, medio (paladín, explorador) y magia de pacto (brujo, que los recupera en descanso corto).

## Pendiente

- Crear personajes de nivel 1 con asistente (matriz estándar, compra de puntos o tiradas).

## Suposiciones

- La v1 no administra encuentros ni turnos.
- Las reglas se limitan a D&D 2024 en español. Las excepciones se modelan como contenido casero dentro de la ficha.
