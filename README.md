# 🏰 La Taberna del Aventurero Desafortunado

Fichas de personaje de **Dragones y Mazmorras 2024 (5.5e)** para una partida entre amigos. La interfaz sigue el proyecto de Stitch “Gestor de Rol Medieval”: pergamino, granate y latón, con tipografía editorial y datos de juego alineados como un grimorio.

## Qué hace

- **Vista del máster** (`/`): resumen de todas las fichas (PG, CA, iniciativa, percepción pasiva, dados de golpe, espacios y recursos). Se actualiza sola cada 10 s. Desde aquí se crean e importan fichas.
- **Nueva ficha** (`/nueva-ficha`): personaje de nivel 1 con matriz estándar, compra de puntos (27) o tiradas 4d6, bonificador del trasfondo (+2/+1 o +1/+1/+1) y habilidades de la clase. Calcula PG, CA, salvaciones, aptitud mágica y espacios, y añade los rasgos de nivel 1 de la clase.
- **Ficha** (`/personajes/<id>`): editable como una de papel. Nombre, especie, clase, nivel, PX, características, velocidad, PG, dados de golpe, aptitud mágica y espacios se editan en el sitio. La CA se calcula con la armadura y el escudo equipados (o la Defensa sin armadura de bárbaros y monjes), más un campo «otros» para Armadura de mago u objetos mágicos. El resumen tiene tres columnas: la ficha con sus salvaciones (cada una con sus habilidades anidadas debajo), luego ataques, recursos y rasgos, y por último el grimorio. Las competencias en salvaciones y habilidades se marcan pulsando el círculo: ○ sin competencia, ● competente, ◆ pericia.
- **Armas, conjuros, objetos y rasgos**: se añaden desde los listados del SRD 5.2 o se crean desde cero. Al pulsar una fila se abre su edición, y el botón «×» la quita sin abrirla. En Recursos, «×» quita un nivel de espacios o deja el rasgo u objeto sin usos. Todo se puede deshacer.
- **Descripción al pasar el ratón** (o al enfocar con teclado): usos, daño, competencia y la característica que lo mejora, con el desglose del número. Por ejemplo, «Ataque +6 = FUE +3 + competencia +3», o «2d8 +4 curación · suma INT +4».
- **En partida**: todo lo que se puede tirar lleva un dadito al lado (icono en `public/dado.svg`). Tiradas de características, salvaciones, habilidades, ataques y conjuros (los críticos duplican los dados), daño y curación, dados de golpe, usos con gastar y recuperar, descansos corto y largo, subida de nivel guiada, deshacer, notas e historial.
- **Gestión** (pestaña de la ficha): exporta el archivo JSON, reemplaza la ficha con un archivo importado (se puede deshacer, salvo las notas) y elimina la ficha del servidor tras pedir confirmación. El borrado no se puede deshacer.
- Cada cambio se guarda solo en el servidor medio segundo después; si sales antes, se envía al cerrar la página. El indicador de la cabecera muestra si está guardado, guardando o con error.

No hay cuentas ni permisos: cualquiera con acceso a la red puede ver y editar todas las fichas. Está pensada para servirse solo por red local o Tailscale.

## Desarrollo

```bash
pnpm install
pnpm dev         # http://localhost:4321 y en la IP de la máquina
pnpm check       # tipos
pnpm build
```

Las fuentes (EB Garamond, Hanken Grotesk y JetBrains Mono) se configuran en `astro.config.mjs` con la API de fuentes de Astro. Se descargan de Google Fonts la primera vez que se compila o se arranca `pnpm dev`, quedan en caché (`node_modules/.astro/` y `.astro/`) y la app las sirve desde `/_astro/fonts/`, así que en la mesa no hace falta internet. En CSS se usan con `var(--font-garamond)`, `var(--font-hanken)` y `var(--font-mono)`.

En mint-node, el servidor de desarrollo corre como unidad transitoria de systemd de usuario, para que no dependa de la terminal ni de la sesión del agente que lo lanzó. No sobrevive a un reinicio.

```bash
systemd-run --user --unit=taberna-dev --working-directory="$PWD" --setenv=PATH="$PATH" pnpm dev --port 4321
systemctl --user status taberna-dev    # estado
journalctl --user -u taberna-dev -f    # logs
systemctl --user stop taberna-dev      # parar
```

## Producción (mint-node)

```bash
pnpm install --frozen-lockfile
pnpm build
HOST=0.0.0.0 PORT=4321 DATA_DIR=/ruta/a/fichas pnpm start
```

- `DATA_DIR` es la carpeta de las fichas. Por defecto, `data/personajes` relativo al directorio de arranque. Está fuera de git, así que no aparece entre los cambios del repositorio.
- Si la carpeta no existe, se crea con las fichas de `data/ejemplos`.
- Para hacer copia de seguridad, basta con copiar esa carpeta.

## Datos

Cada personaje es un archivo `<id>.json` con esta forma:

```json
{ "schemaVersion": 3, "version": 12, "character": { "name": "…", "level": 5, "hp": { "current": 22, "max": 27 } } }
```

- El esquema completo está en `src/lib/schema.ts`, y se valida al leer, guardar e importar.
- `version` sube con cada guardado. Si alguien guarda desde una copia desactualizada (otra pestaña), el servidor lo rechaza y la ficha pide recargar en vez de pisar cambios.
- `schemaVersion` cambia cuando lo hace la forma de `character`. `src/lib/migrate.ts` convierte los archivos antiguos al leerlos o importarlos, y se reescriben en el formato actual al guardar. La v1 (sin habilidades ni armas) se migra completando conjuros, armas y objetos desde los listados cuando el nombre coincide. La v2 (CA escrita a mano) se migra equipando las armaduras conocidas y guardando la diferencia en «otros», para que la CA no cambie.
- El archivo exportado es el mismo que hay en disco. Importar desde la vista del máster crea una ficha nueva; importar desde la pestaña Gestión de una ficha reemplaza su contenido.

## Nueva campaña

1. Cambia el nombre en `src/config.ts`.
2. Vacía o cambia `DATA_DIR` e importa las fichas nuevas.

## Estructura

- `src/lib/schema.ts`: esquema Zod del archivo de ficha. Solo lo usa el servidor. `src/lib/migrate.ts`: migraciones entre versiones.
- `src/lib/sheet.ts`: reglas 2024 (PX, competencia, habilidades, clases, espacios de lanzador completo, medio y de pacto, ataque y daño de armas, CD de conjuros, escalado de trucos) y valores derivados. Lo comparten el servidor y el cliente.
- `src/lib/describe.ts`: contenido de los tooltips y del resumen del diálogo de edición.
- `src/data/catalog.ts` y `src/data/spells.ts`: listados de armas, armaduras y objetos, dotes, rasgos de clase y conjuros de nivel 0 a 9. Al añadir una entrada se copia a la ficha.
- `src/lib/store.ts`: lectura y escritura de archivos: escritura atómica, guardados en serie por ficha, control de versión y borrado.
- `src/actions/index.ts`: acciones `saveCharacter`, `importCharacter`, `parseCharacter` (valida un archivo sin guardarlo) y `deleteCharacter`.
- `src/lib/create.ts` y `src/scripts/new-character.ts`: reglas y formulario de creación de personajes.
- `src/pages/index.astro`: vista del máster. `src/pages/nueva-ficha.astro`: creación. `src/pages/personajes/[slug].astro`: ficha.
- `src/scripts/sheet/`: interacción de la ficha.
  - `state.ts`: estado, guardado y deshacer.
  - `main.ts`: pintado, campos con `data-path`, tiradas y recursos.
  - `entries.ts`: diálogo de edición y listados.
  - `tooltip.ts` y `level-up.ts`: el tooltip y el asistente de subida de nivel.
  - `manage.ts`: pestaña Gestión (exportar, importar y eliminar).
- `stitch_gestor_de_rol_medieval/`: referencia visual (capturas, HTML y `tome_grimoire/DESIGN.md`).

## Licencia del contenido de reglas

Los listados de armas, objetos, dotes, rasgos de clase y conjuros se basan en el SRD 5.2. Los nombres están en español y las descripciones son resúmenes propios, no el texto oficial.

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.
