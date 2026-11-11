# 🏰 La Taberna del Aventurero Desafortunado

Fichas de personaje de **Dragones y Mazmorras 2024 (5.5e)** para una partida entre amigos. La interfaz sigue el proyecto de Stitch “Gestor de Rol Medieval”: pergamino, granate y latón, con tipografía editorial y datos de juego alineados como un grimorio.

## Qué hace

- **Vista del máster** (`/`): resumen de todas las fichas (PG, CA, iniciativa, percepción pasiva, dados de golpe, espacios y recursos). Se actualiza sola cada 10 s. Desde aquí se importan fichas.
- **Ficha** (`/personajes/<id>`): editable como una de papel. Nombre, especie, clase, nivel, PX, características, CA, velocidad, PG, dados de golpe, aptitud mágica y espacios se editan en el sitio. Las competencias en salvaciones y habilidades se marcan pulsando el círculo: ○ sin competencia, ● competente, ◆ pericia.
- **Armas, conjuros, objetos y rasgos**: se añaden desde los listados del SRD 5.2 o se crean desde cero. Al pulsar una fila se abre su edición.
- **Descripción al pasar el ratón** (o al enfocar con teclado): usos, daño, competencia y la característica que lo mejora, con el desglose del número. Por ejemplo, «Ataque +6 = FUE +3 + competencia +3», o «2d8 +4 curación · suma INT +4».
- **En partida**: tiradas de características, salvaciones, habilidades, ataques y conjuros (los críticos duplican los dados), daño y curación, dados de golpe, usos con gastar y recuperar, descansos corto y largo, subida de nivel guiada, deshacer, notas, historial y exportación a JSON.
- Cada cambio se guarda solo en el servidor medio segundo después. El indicador de la cabecera muestra si está guardado, guardando o con error.

No hay cuentas ni permisos: cualquiera con acceso a la red puede ver y editar todas las fichas. Está pensada para servirse solo por red local o Tailscale.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321 y en la IP de la máquina
npm run check    # tipos
npm run build
```

En mint-node, el servidor de desarrollo corre como unidad transitoria de systemd de usuario, para que no dependa de la terminal ni de la sesión del agente que lo lanzó. No sobrevive a un reinicio.

```bash
systemd-run --user --unit=taberna-dev --working-directory="$PWD" --setenv=PATH="$PATH" npm run dev -- --port 4321
systemctl --user status taberna-dev    # estado
journalctl --user -u taberna-dev -f    # logs
systemctl --user stop taberna-dev      # parar
```

## Producción (mint-node)

```bash
npm ci
npm run build
HOST=0.0.0.0 PORT=4321 DATA_DIR=/ruta/a/fichas npm start
```

- `DATA_DIR` es la carpeta de las fichas. Por defecto, `data/personajes` relativo al directorio de arranque. Está fuera de git, así que no aparece entre los cambios del repositorio.
- Si la carpeta no existe, se crea con las fichas de `data/ejemplos`.
- Para hacer copia de seguridad, basta con copiar esa carpeta.

## Datos

Cada personaje es un archivo `<id>.json` con esta forma:

```json
{ "schemaVersion": 2, "version": 12, "character": { "name": "…", "level": 5, "hp": { "current": 22, "max": 27 } } }
```

- El esquema completo está en `src/lib/schema.ts`, y se valida al leer, guardar e importar.
- `version` sube con cada guardado. Si alguien guarda desde una copia desactualizada (otra pestaña), el servidor lo rechaza y la ficha pide recargar en vez de pisar cambios.
- `schemaVersion` cambia cuando lo hace la forma de `character`. `src/lib/migrate.ts` convierte los archivos antiguos al leerlos o importarlos, y se reescriben en el formato actual al guardar. La v1 (sin habilidades ni armas) se migra completando conjuros, armas y objetos desde los listados cuando el nombre coincide.
- El archivo exportado es el mismo que hay en disco. La importación crea una ficha nueva.

## Nueva campaña

1. Cambia el nombre en `src/config.ts`.
2. Vacía o cambia `DATA_DIR` e importa las fichas nuevas.

## Estructura

- `src/lib/schema.ts`: esquema Zod del archivo de ficha. Solo lo usa el servidor. `src/lib/migrate.ts`: migraciones entre versiones.
- `src/lib/sheet.ts`: reglas 2024 (PX, competencia, habilidades, clases, espacios de lanzador completo, medio y de pacto, ataque y daño de armas, CD de conjuros, escalado de trucos) y valores derivados. Lo comparten el servidor y el cliente.
- `src/lib/describe.ts`: contenido de los tooltips y del resumen del diálogo de edición.
- `src/data/catalog.ts` y `src/data/spells.ts`: listados de armas, objetos, dotes y conjuros (nivel 0 a 5). Al añadir una entrada se copia a la ficha.
- `src/lib/store.ts`: lectura y escritura de archivos: escritura atómica, guardados en serie por ficha y control de versión.
- `src/actions/index.ts`: acciones `saveCharacter` e `importCharacter`.
- `src/pages/index.astro`: vista del máster. `src/pages/personajes/[slug].astro`: ficha.
- `src/scripts/sheet/`: interacción de la ficha.
  - `state.ts`: estado, guardado y deshacer.
  - `main.ts`: pintado, campos con `data-path`, tiradas y recursos.
  - `entries.ts`: diálogo de edición y listados.
  - `tooltip.ts` y `level-up.ts`: el tooltip y el asistente de subida de nivel.
- `stitch_gestor_de_rol_medieval/`: referencia visual (capturas, HTML y `tome_grimoire/DESIGN.md`).

## Licencia del contenido de reglas

Los listados de armas, objetos, dotes y conjuros se basan en el SRD 5.2. Los nombres están en español y las descripciones son resúmenes propios, no el texto oficial.

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.
