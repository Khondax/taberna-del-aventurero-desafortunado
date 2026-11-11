# 🏰 La Taberna del Aventurero Desafortunado

Fichas de personaje de **Dragones y Mazmorras 2024 (5.5e)** para una partida entre amigos. La interfaz sigue el proyecto de Stitch “Gestor de Rol Medieval”: pergamino, granate y latón, con tipografía editorial y datos de juego alineados como un grimorio.

## Qué hace

- **Vista del máster** (`/`): resumen de todas las fichas (PG y PG temporales, CA, iniciativa, percepción pasiva, dados de golpe, espacios y recursos) con su estado en partida: salvaciones contra la muerte, concentración, estados y agotamiento. Al lado, las tiradas recientes de toda la mesa (personaje, qué tiró, resultado y hora). Todo se actualiza solo cada 10 s. Desde aquí se crean e importan fichas.
- **Nueva ficha** (`/nueva-ficha`): personaje de nivel 1 con matriz estándar, compra de puntos (27) o tiradas 4d6, bonificador del trasfondo (+2/+1 o +1/+1/+1) y habilidades de la clase. Calcula PG, CA, salvaciones, aptitud mágica y espacios, y añade los rasgos de nivel 1 de la clase.
  - Trasfondos del SRD 5.2 (Acólito, Criminal, Sabio y Soldado): al elegir uno del listado quedan marcadas sus dos habilidades, el bonificador solo deja elegir entre sus tres características y la ficha recibe su dote de origen.
  - Especies del SRD 5.2 (Dracónido, Elfo, Enano, Gnomo, Goliat, Humano, Mediano, Orco y Tiflin): al elegir una del listado, la ficha recibe su velocidad y sus rasgos, con usos si los tienen. El tamaño se muestra en el resumen, pero la ficha no lo guarda.
  - Se reconocen sin tildes ni mayúsculas y en femenino (Acólita, Enana…). Cualquier otro texto es un trasfondo o una especie casera y funciona como siempre: habilidades y bonificador libres, velocidad 9 m y sin rasgos.
  - Las elecciones dentro de un rasgo (linaje élfico, ascendencia dracónida, legado infernal, habilidad de Sentidos agudos…) se explican en su descripción y se aplican a mano en la ficha. Tampoco se suma sola la Dureza enana (+1 PG por nivel).
- **Ficha** (`/personajes/<id>`): editable como una de papel. Nombre, especie, clase, nivel, PX, características, velocidad, PG, dados de golpe, aptitud mágica y espacios se editan en el sitio. La CA se calcula con la armadura y el escudo equipados (o la Defensa sin armadura de bárbaros y monjes), más un campo «otros» para Armadura de mago u objetos mágicos. El resumen tiene tres columnas: la ficha con sus salvaciones (cada una con sus habilidades anidadas debajo), luego ataques, recursos y rasgos, y por último el grimorio. Las competencias en salvaciones y habilidades se marcan pulsando el círculo: ○ sin competencia, ● competente, ◆ pericia.
- **Armas, conjuros, objetos y rasgos**: se añaden desde los listados del SRD 5.2 o se crean desde cero. Al pulsar una fila se abre su edición, y el botón «×» la quita sin abrirla. En Recursos, «×» quita un nivel de espacios o deja el rasgo u objeto sin usos. Todo se puede deshacer.
- **Descripción al pasar el ratón** (o al enfocar con teclado): usos, daño, competencia y la característica que lo mejora, con el desglose del número. Por ejemplo, «Ataque +6 = FUE +3 + competencia +3», o «2d8 +4 curación · suma INT +4».
- **En partida**: todo lo que se puede tirar lleva un dadito al lado (icono en `public/dado.svg`). Tiradas de características, salvaciones, habilidades, ataques y conjuros (los críticos duplican los dados), daño y curación, dados de golpe, usos con gastar y recuperar, descansos corto y largo (los usos se recuperan en descanso corto, en largo, nunca o «uno en descanso corto, todos en largo», como Furia, Canalizar divinidad, Forma salvaje o Tomar aliento), subida de nivel guiada, deshacer, notas e historial. Cada tirada queda también en el historial compartido que ve el máster.
  - **PG temporales**: campo junto a los PG, con su tramo de latón en la barra, y botón «＋ PG temp.». El daño los gasta primero, la curación no los suma y no se acumulan: con unos nuevos te quedas con el valor mayor. Se pierden con un descanso largo.
  - **Salvaciones contra la muerte**: a 0 PG aparecen bajo la barra de PG tres casillas de éxito, tres de fallo y el botón de tirada. Con 10 o más es un éxito, un 1 natural cuenta como dos fallos y un 20 natural recupera 1 PG. Recibir daño a 0 PG suma un fallo. Curarse o llegar a tres éxitos reinicia las casillas; con tres éxitos quedas estabilizado.
  - **Concentración** (panel «Concentración y estados», arriba de la columna central): se elige el conjuro en el desplegable, y lanzar uno de concentración desde el grimorio sustituye al anterior. Al recibir daño, el resultado avisa de la salvación de Constitución (CD = máx(10, mitad del daño), hasta 30) y ofrece tirarla; si falla, la concentración termina. También termina con el botón «Terminar» o al caer a 0 PG.
  - **Estados**: los de 2024 se marcan pulsándolos, con su descripción en el tooltip. El agotamiento va por niveles (1 a 6): resta 2 por nivel a las pruebas d20 (las tiradas de la ficha ya lo aplican) y 1,5 m por nivel a la velocidad, como en 2024. Un descanso largo quita un nivel.
  - **Barra de acciones en móvil**: en pantallas estrechas, una barra fija abajo con daño, curación y una tirada rápida de d20, visible desde cualquier pestaña.
- **Monedas** (pestaña Inventario): pc, pp, pe, po y ppt. Cuentan para la carga con la regla de 2024: 50 monedas pesan 1 libra, que aquí son 0,5 kg como en el resto del equipo.
- **Gestión** (pestaña de la ficha): exporta el archivo JSON, reemplaza la ficha con un archivo importado (se puede deshacer, salvo las notas) y elimina la ficha del servidor tras pedir confirmación. Desde la interfaz no se puede deshacer, pero el archivo pasa a la papelera del servidor (ver [Copias de seguridad](#copias-de-seguridad)).
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

## Tests

```bash
pnpm test        # unitarios (Vitest): reglas, migraciones, creación y almacenamiento
pnpm test:e2e    # de extremo a extremo (Playwright, Chromium)
```

- `tests/unit/`: reglas de `sheet.ts` (incluido el estado en partida: PG temporales, salvaciones contra la muerte, concentración y agotamiento), descansos con recuperación parcial, migraciones v1, v2, v3 y v4, `create.ts` (con los trasfondos y especies del listado) y `store.ts` (con el historial de tiradas). `store.ts` se prueba con un `DATA_DIR` temporal. `tests/fixtures/` guarda los ejemplos en formato v2 y el Hermano Tobías en formatos v3 y v4 para las migraciones.
- `tests/e2e/`: `pnpm test:e2e` compila el proyecto y arranca `dist/server/entry.mjs` en `127.0.0.1:4517` con un `DATA_DIR` temporal, que se borra al terminar. Cada test copia ahí su propia ficha de `data/ejemplos`, así que no tocan las fichas reales ni dependen del orden.
- La primera vez, si no está el navegador: `pnpm exec playwright install chromium`. La versión de `@playwright/test` está fijada para que coincida con el navegador instalado.
- Un archivo concreto: `pnpm test tests/unit/migrate.test.ts` o `pnpm test:e2e tests/e2e/armor.spec.ts`. Los detalles de los fallos quedan en `test-results/`.

## Producción (mint-node)

```bash
pnpm install --frozen-lockfile
pnpm build
HOST=0.0.0.0 PORT=4321 DATA_DIR=/ruta/a/fichas pnpm start
```

- `DATA_DIR` es la carpeta de las fichas. Por defecto, `data/personajes` relativo al directorio de arranque. Está fuera de git, así que no aparece entre los cambios del repositorio.
- Si la carpeta no existe, se crea con las fichas de `data/ejemplos`.
- Para hacer copia de seguridad, basta con copiar esa carpeta.
- Las copias automáticas y la papelera se guardan dentro de ella (ver [Copias de seguridad](#copias-de-seguridad)).

### Servicio permanente

En mint-node, el build se sirve con la unidad de systemd de usuario `deploy/taberna.service`. Arranca con el sistema y se reinicia si falla. Sirve el checkout principal en el puerto 4321 y guarda las fichas en `~/.local/share/taberna/personajes`.

La unidad usa la ruta absoluta de Node (`~/.nvm/versions/node/v26.12.0/bin/node`). Si cambias de versión de Node, actualiza `ExecStart` y vuelve a instalarla.

Instalar y activar (desde el checkout principal):

```bash
pnpm install --frozen-lockfile && pnpm build
systemctl --user stop taberna-dev                # libera el puerto 4321 si corre el servidor de desarrollo
mkdir -p ~/.local/share/taberna
cp -a data/personajes ~/.local/share/taberna/    # migra las fichas actuales ANTES del primer arranque
cp deploy/taberna.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now taberna
loginctl enable-linger "$USER"                   # para que arranque sin iniciar sesión (basta una vez)
```

Si `~/.local/share/taberna/personajes` no existe al arrancar, el servidor la crea con las fichas de ejemplo. Por eso hay que copiar las fichas reales antes de activarlo.

Actualizar a una versión nueva:

```bash
git pull
pnpm install --frozen-lockfile && pnpm build
systemctl --user restart taberna
```

Estado y logs: `systemctl --user status taberna` y `journalctl --user -u taberna -f`. Si cambias la plantilla, vuelve a copiarla y ejecuta `systemctl --user daemon-reload` antes de reiniciar.

## Datos

Cada personaje es un archivo `<id>.json` con esta forma:

```json
{ "schemaVersion": 5, "version": 12, "character": { "name": "…", "level": 5, "hp": { "current": 22, "max": 27, "temp": 0 } } }
```

- El esquema completo está en `src/lib/schema.ts`, y se valida al leer, guardar e importar.
- `version` sube con cada guardado. Si alguien guarda desde una copia desactualizada (otra pestaña), el servidor lo rechaza y la ficha pide recargar en vez de pisar cambios.
- `schemaVersion` cambia cuando lo hace la forma de `character`. `src/lib/migrate.ts` convierte los archivos antiguos al leerlos o importarlos, y se reescriben en el formato actual al guardar. La v1 (sin habilidades ni armas) se migra completando conjuros, armas y objetos desde los listados cuando el nombre coincide. La v2 (CA escrita a mano) se migra equipando las armaduras conocidas y guardando la diferencia en «otros», para que la CA no cambie. La v3 se migra añadiendo el estado en partida (PG temporales, salvaciones contra la muerte, concentración, estados y agotamiento) y las monedas, todo a cero o vacío. La v4 se migra pasando a «uno en descanso corto, todos en largo» los rasgos cuyo nombre coincide exactamente con uno del listado que se recupera así (Furia, Canalizar divinidad, Canalizar divinidad (paladín), Forma salvaje y Tomar aliento) y que estaban en descanso largo, como los añadía el listado. No se adivina por nombres parecidos, y si alguien eligió otra recuperación a mano, se respeta.
- El archivo exportado es el mismo que hay en disco. Importar desde la vista del máster crea una ficha nueva; importar desde la pestaña Gestión de una ficha reemplaza su contenido.
- Las tiradas no se guardan en la ficha, para que tirar no cambie su `version` ni provoque conflictos. Van a `.tiradas.json`, dentro de `DATA_DIR`: una lista con las 50 últimas de toda la mesa (`date`, `slug`, `name`, `label` y `result`), validada con `rollEntrySchema`. Por empezar con punto, la vista del máster no lo confunde con una ficha. Si se borra o se daña, el historial vuelve a empezar vacío.

## Copias de seguridad

El servidor guarda dos subcarpetas dentro de `DATA_DIR`. La vista del máster no las muestra.

- `.historial/<id>/<fecha>.json`: antes de guardar una ficha, copia el archivo que había en disco. Hace como mucho una copia cada 10 minutos por ficha y conserva las 30 más recientes. La fecha está en UTC, por ejemplo `2026-11-11T17-30-00.000Z.json`.
- `.papelera/<id>-<fecha>.json`: las fichas eliminadas desde la pestaña Gestión.

Para restaurar, copia el archivo encima de la ficha (o a `<id>.json` si se había eliminado) y recarga la página:

```bash
cd ~/.local/share/taberna/personajes
cp .historial/hermano-tobias/2026-11-11T17-30-00.000Z.json hermano-tobias.json
```

Las pestañas que tuvieran la ficha abierta detectan el cambio de versión al guardar y piden recargar. Los archivos antiguos se migran al leerlos, así que restaurar uno de una versión anterior del esquema también funciona.

## Nueva campaña

1. Cambia el nombre en `src/config.ts`.
2. Vacía o cambia `DATA_DIR` e importa las fichas nuevas.

## Estructura

- `src/lib/schema.ts`: esquema Zod del archivo de ficha. Solo lo usa el servidor. `src/lib/migrate.ts`: migraciones entre versiones.
- `src/lib/sheet.ts`: reglas 2024 (PX, competencia, habilidades, clases, espacios de lanzador completo, medio y de pacto, ataque y daño de armas, CD de conjuros, escalado de trucos, carga con monedas, estados, agotamiento, PG temporales, salvaciones contra la muerte y CD de concentración) y valores derivados. Lo comparten el servidor y el cliente.
- `src/lib/describe.ts`: contenido de los tooltips y del resumen del diálogo de edición.
- `src/data/catalog.ts` y `src/data/spells.ts`: listados de armas, armaduras y objetos, dotes, rasgos de clase y conjuros de nivel 0 a 9. Al añadir una entrada se copia a la ficha.
- `src/data/origins.ts`: trasfondos (características, habilidades y dote de origen) y especies (tamaño, velocidad y rasgos) para la creación de personajes.
- `src/lib/store.ts`: lectura y escritura de archivos: escritura atómica, guardados en serie por ficha, control de versión, instantáneas en `.historial/`, papelera e historial de tiradas (`.tiradas.json`).
- `src/actions/index.ts`: acciones `saveCharacter`, `importCharacter`, `parseCharacter` (valida un archivo sin guardarlo), `deleteCharacter` y `logRoll` (apunta una tirada en el historial compartido).
- `src/lib/create.ts` y `src/scripts/new-character.ts`: reglas y formulario de creación de personajes.
- `src/pages/index.astro`: vista del máster. `src/pages/nueva-ficha.astro`: creación. `src/pages/personajes/[slug].astro`: ficha.
- `src/scripts/sheet/`: interacción de la ficha.
  - `state.ts`: estado, guardado y deshacer.
  - `main.ts`: pintado, campos con `data-path`, tiradas, PG (también la barra de móvil), salvaciones contra la muerte, concentración, estados y recursos.
  - `entries.ts`: diálogo de edición y listados.
  - `tooltip.ts` y `level-up.ts`: el tooltip y el asistente de subida de nivel.
  - `manage.ts`: pestaña Gestión (exportar, importar y eliminar).
- `tests/`: tests unitarios (`unit/`), de extremo a extremo (`e2e/`) y archivos de prueba (`fixtures/`).
- `deploy/taberna.service`: unidad de systemd de usuario del servicio de producción.
- `stitch_gestor_de_rol_medieval/`: referencia visual (capturas, HTML y `tome_grimoire/DESIGN.md`).

## Forma de trabajar (personas y agentes)

- Cada tarea va en una rama nueva creada desde `master`. `develop` ya no existe, y `backup/develop-wip` solo guarda trabajo antiguo obsoleto: no se parte de ella.
- Un solo agente a la vez por zona del código: ficha (`src/scripts/sheet/`, `src/pages/personajes/`), esquema y datos (`src/lib/schema.ts`, `src/lib/migrate.ts`, `src/lib/store.ts`) o estilos (`src/styles/`). Solo se trabaja en paralelo en zonas que no se pisen.
- Antes de integrar, rebasa la rama sobre `master` e intégrala con fast-forward (`git merge --ff-only`).
- Antes de integrar tienen que pasar `pnpm check`, `pnpm build`, `pnpm test` y `pnpm test:e2e`.
- No se hace push sin que lo pida Miguel.

## Licencia del contenido de reglas

Los listados de armas, objetos, dotes, rasgos de clase, trasfondos, especies y conjuros se basan en el SRD 5.2. Los nombres están en español y las descripciones son resúmenes propios, no el texto oficial.

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.
