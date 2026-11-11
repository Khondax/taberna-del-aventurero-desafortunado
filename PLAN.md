# Fichas D&D 2024 - La Taberna del Aventurero Desafortunado

## Resumen

Aplicación web en español para una partida de D&D 2024 (5.5e) entre amigos. Se centra en la consulta y el seguimiento durante la sesión: fichas, recursos, grimorio, inventario, descansos y subida de nivel. Las fichas son públicas dentro de la mesa y el máster tiene una vista con el resumen de todas. No hay cuentas ni roles.

La interfaz sigue el proyecto de Stitch “Gestor de Rol Medieval”: estética de manuscrito funcional, pergamino/granate/latón, EB Garamond para narrativa, Hanken Grotesk para lectura y JetBrains Mono para valores de juego.

## Decisiones

- Astro con `@astrojs/node`, servido desde mint-node solo por red local o Tailscale.
- Persistencia en un archivo JSON por personaje, sin base de datos. El formato de exportación es el mismo que el de disco.
- Sin autenticación: puede editar cualquiera con acceso a la red. Si algún día se expone fuera, habrá que añadir al menos una contraseña de mesa.
- JavaScript sin framework en cliente. Ver «Evaluación de Svelte» para cuándo convertir la ficha en una isla Svelte.

## Evaluación de Svelte (noviembre de 2026)

**Medidas.** El cliente de la ficha son 1128 líneas en `src/scripts/sheet/` (`entries.ts` 369, `main.ts` 359, `state.ts` 136, `level-up.ts` 118, `tooltip.ts` 79, `manage.ts` 67), más 176 de `new-character.ts`, y la plantilla `personajes/[slug].astro` tiene 364. Tras `pnpm build`, `dist/client/_astro` suma 101 KB de JS (33 KB con gzip). La ficha carga unos 94 KB (32 KB con gzip): su script ocupa 33 KB y los listados (`spells` y `catalog`), 41 KB, que seguirían igual con Svelte.

**Qué complica el código sin framework.** El modelo ya es «estado → `render()` lo repinta todo», y funciona, pero lo hace a mano:

- Cada fila tiene dos fuentes. `EntryRow` y `ResourceRow` se pintan en el servidor con props, y en el cliente se clonan desde un `<template>` y se rellenan con `fillRow` y `fillResource`, que repiten los `aria-label`, los `hidden` y los `data-path`. Además, las filas del buscador de listados (`renderPicker`) rehacen la misma marca con `createElement`. Un campo nuevo en una fila obliga a tocar tres sitios.
- `renderList` sincroniza las listas por posición. Funciona porque las filas son planas, pero no admite listas anidadas ni filas con estado propio.
- Hay 14 `data-bind`, 13 `data-path` y los `data-toggle`, que se vuelven a buscar en todo el documento con cada cambio. Las claves de `liveText` tienen que coincidir con las de la plantilla sin ayuda de los tipos.
- El formulario del diálogo de edición (`buildField` y `readForm`), el tooltip y los usos de la subida de nivel construyen DOM a mano.

En total, unas 230 líneas (alrededor del 18 % del cliente) son fontanería que Svelte haría innecesaria. El resto son reglas, tiradas y guardado, y se quedarían como están.

**Qué ganaríamos.** Una sola plantilla por fila para el servidor y el cliente, `bind:value` en lugar de `data-path`, `{#each}` con clave en lugar de `renderList`, y comprobación de tipos en la plantilla. `state.ts` (deshacer y guardado) y `src/lib/` se reutilizarían tal cual.

**Cuánto costaría.** Dos dependencias (`svelte` y `@astrojs/svelte`) y, probablemente, `svelte-check` para que `pnpm check` cubra los `.svelte`. Unos 10-15 KB más de JS con gzip por el runtime (estimado, sin medir). Reescribir la plantilla de la ficha y los cinco módulos de interacción, de dos a tres días de trabajo, con riesgo de regresiones en el foco, los diálogos, el tooltip y el deshacer. No hay tests de interfaz que lo protejan.

**Recomendación.** Ahora no: la ficha tiene listas planas y un solo repintado, y el código actual se entiende bien. Merece la pena migrar la ficha entera a una isla `client:load` (la vista del máster y la creación pueden seguir como están) cuando se cumpla una de estas condiciones:

- Se aborda la multiclase o los trasfondos y especies con datos, que traen bloques repetidos y anidados (varias clases con sus rasgos y espacios), justo lo que `renderList` no cubre.
- Las filas necesitan estado propio: edición en línea, reordenar o desplegar.
- Aparecen fallos repetidos por desajustes entre la plantilla Astro y `fillRow`, `fillResource` o `renderPicker`.

Antes de migrar conviene tener unos tests end-to-end de la ficha (tiradas, edición, deshacer y guardado) que sirvan de red.

## Hecho

- Vista del máster con refresco automático, creación e importación.
- Creación de personajes de nivel 1: matriz estándar, compra de puntos o tiradas, bonificador del trasfondo y habilidades de clase.
- Ficha editable en el sitio: identidad, nivel, PX, características, CA, velocidad, PG, dados de golpe, competencias en salvaciones y habilidades, aptitud mágica y espacios.
- Armas, conjuros, objetos y rasgos desde los listados del SRD 5.2 o personalizados, con diálogo de edición y tooltip con desglose de cada número.
- Tiradas de características, salvaciones, habilidades, ataques y conjuros. Recursos, descansos, subida de nivel, deshacer, exportación y guardado automático con detección de conflictos.
- Formato v5 con migración automática desde v1, v2, v3 y v4.
- Listados con conjuros de nivel 0 a 9 y los rasgos de clase principales de 2024, filtrables por clase.
- CA calculada desde la armadura y el escudo equipados, con Defensa sin armadura de bárbaro y monje.
- Espacios al subir de nivel con las tablas de lanzador completo, medio (paladín, explorador) y magia de pacto (brujo, que los recupera en descanso corto).
- Servicio permanente de producción en mint-node con una unidad de systemd de usuario (`deploy/taberna.service`).
- Copias automáticas de cada ficha al guardar (`.historial/`, una cada 10 minutos como mucho, las 30 últimas) y papelera para las fichas eliminadas.
- Tests en el repositorio: unitarios con Vitest (`pnpm test`) y de extremo a extremo con Playwright (`pnpm test:e2e`).
- Recuperación parcial de usos («uno en descanso corto, todos en largo») para Furia, Canalizar divinidad, Forma salvaje y Tomar aliento, en los descansos, el diálogo de edición, el listado y la migración.
- En partida: PG temporales, salvaciones contra la muerte, concentración con su salvación de Constitución, estados de 2024 y agotamiento por niveles (también en la tarjeta del máster), monedas que cuentan para la carga, historial de tiradas compartido en la vista del máster (`.tiradas.json`) y barra de acciones fija en móvil.

## Pendiente

- Multiclase y subclases lanzadoras (caballero arcano, embaucador arcano): sus espacios se ajustan a mano en el grimorio.
- Muerte instantánea por daño masivo y críticos a 0 PG (dos fallos): el formulario de daño no sabe si el golpe es crítico ni lo aplica solo; se marcan a mano en las casillas.
- Trasfondos y especies con sus datos (habilidades, bonificadores, dotes de origen): hoy se escriben a mano y se eligen libremente.

## Suposiciones

- La v1 no administra encuentros ni turnos.
- Las reglas se limitan a D&D 2024 en español. Las excepciones se modelan como contenido casero dentro de la ficha.
