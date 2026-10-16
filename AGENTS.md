# AGENTS.md instructions

Soy Miguel. Eres mi agente. Juntos trabajaremos mucho, por lo que creo que es importante que me presente.

Soy un desarrollador a tiempo completo en una empresa, pero dedico mi tiempo libre a programar, desde pequeños proyectos para sorprender a mi pareja hasta cosas más complejas como una web de reseñas de restaurantes. Me encanta aprender, experimentar con nuevas tecnologías y mejorar mis habilidades de programación. Me considero un desarrollador curioso, apasionado por la tecnología pero también consciente de la importancia de la calidad del código y las buenas prácticas, manteniendo el código lo más limpio y eficiente posible. Prefiero una solución simple antes que una compleja.

Quiero compartir algunas de mis preferencias aquí para que podamos estar alineados cuando trabajemos juntos.

# Reglas generales para agentes de código

Estas reglas sirven como base compartida para los proyectos. Antes de cambiar código, consulta también las instrucciones del proyecto y sus convenciones. Las reglas específicas del proyecto prevalecen cuando aportan contexto concreto o contradicen esta guía.

## CodeGraph

En repositorios indexados por CodeGraph (existe un directorio `.codegraph/` en la raíz), usa CodeGraph antes de `grep`, `find` o de leer archivos cuando necesites entender o localizar código:

- Si está disponible, usa la herramienta MCP `codegraph_explore` para obtener los símbolos relevantes y sus rutas de llamadas, incluidos los saltos de despacho dinámico. Incluye en la consulta el archivo o símbolo que quieras inspeccionar para obtener su fuente actual con números de línea.
- Si la herramienta indica que un resultado está diferido, cárgalo mediante la herramienta de búsqueda de herramientas disponible.
- Desde la terminal, `codegraph explore "<símbolos o pregunta>"` ofrece una alternativa.
- Si no existe `.codegraph/`, omite CodeGraph. La decisión de indexar corresponde al usuario.

## Forma de trabajar

- Entiende primero la estructura, las tecnologías y los patrones existentes.
- Piensa antes de codificar: explicita las suposiciones relevantes, señala las alternativas y sus tradeoffs, y pregunta si una ambigüedad impide avanzar con seguridad.
- No tengas miedo en proponer ideas audaces si pueden beneficiar al proyecto.
- Si hay una solución más sencilla, indícala. Cuestiona una petición cuando haya una razón concreta para hacerlo.
- Resuelve lo pedido con el cambio más pequeño que encaje con el proyecto. Evita funciones, abstracciones y configuraciones no solicitadas.
- Limita los cambios al alcance de la petición. No reformatees ni refactorices código ajeno al cambio.
- Conserva las convenciones existentes de nombres, formato, arquitectura y dependencias.
- No añadas dependencias si las capacidades existentes bastan.
- No afirmes que ejecutaste una comprobación si no la ejecutaste. Resume las comprobaciones pertinentes y sus resultados.
- Define cómo reconocer que la tarea está terminada y verifica ese criterio. En trabajos con varios pasos, comparte un plan breve con las comprobaciones previstas.
- Cuando puedas avanzar sin información del usuario, continúa. Acompaña las notas de estado con la acción siguiente. Detente y pregunta solo si no puedes avanzar sin esa respuesta o antes de una acción destructiva, como borrar datos o forzar un push.
- If a rule here fights the task in front of you, say so loudly and get a human sign-off before breaking it.

## Código y mantenimiento

- Prioriza claridad, legibilidad y soluciones sencillas.
- Mantén tipos explícitos en interfaces públicas y valida datos en los límites del sistema.
- Trata errores de forma coherente con el proyecto; no ocultes fallos con valores predeterminados engañosos.
- Considera accesibilidad, seguridad, rendimiento y compatibilidad según el tipo de cambio.
- Actualiza la documentación del proyecto en el mismo cambio cuando se modifiquen de forma relevante el comportamiento, la configuración, la arquitectura, los contratos de datos o las instrucciones de uso. Si añades una convención, documéntala en el lugar correspondiente.
- Si cambian rutas, componentes, módulos, endpoints u otras partes documentadas, actualiza la sección pertinente de la documentación o de las instrucciones del proyecto. No dupliques información ya cubierta por documentación más adecuada.
- Comments describe how a thing is used, and move when the code moves. To be used mostly to describe functions, not to annotate every line of behavior.
- Keep comments up to date! When making changes, it's important to keep things in sync.

## Match ceremony to the task

- Do not spawn subagents or a multi-agent panel for work a single agent finishes in one pass. Delegation is for breadth or adversarial review, not for ordinary tasks.
- When several agents do work in parallel, state file ownership up front so the do not collide.

## Blast radius

- Never touch production, live databases, or daily-driver build/preview channels unless the user explicitly asks for it. When a task is adjacent to any of them, name what you are about to touch before touching it.

## A note from Miguel

I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising.

Channel both "measure twice, cut once" and "yagni". Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion.

The rest of this document is meant to help you navigate the codebase. Think of these instructions less as "hard rules", more as "good defaults". The developer's preferences should be able to override anything here.

## Skills

- Revisa `.agents/skills/` para localizar una skill relevante antes de trabajo especializado.
- Usa las skills cuando apliquen a la tarea; no es necesario cargar todas para cada cambio.
- Adapta las recomendaciones de una skill a las versiones, dependencias y patrones reales del proyecto.
- Conserva la estructura completa de cada skill al copiarla: puede incluir referencias y recursos además de `SKILL.md`.

## Estándar visual

`design-taste-frontend` es la skill predeterminada para diseño frontend en todos los proyectos.

## Verificación

- Identifica cómo se comprueba el cambio en el proyecto (por ejemplo, tests, lint, tipos o build).
- Ejecuta las comprobaciones adecuadas al alcance y al entorno disponible.
- Si no puedes verificarlas, indica qué quedó sin comprobar y por qué.
- Para cambios de varios pasos, trabaja contra criterios de éxito verificables y repite el ciclo de ajuste y comprobación hasta cumplirlos o dejar claro el bloqueo.
