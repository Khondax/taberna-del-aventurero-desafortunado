# 🏰 La Taberna del Aventurero Desafortunado

Aplicación Astro para gestionar fichas de personaje de **Dragones y Mazmorras 2024 (5.5e)**. La interfaz sigue el proyecto de Stitch “Gestor de Rol Medieval”: pergamino, granate y latón, con tipografía editorial y datos de juego alineados como un grimorio.

## Estado actual

La primera vertical slice está disponible en `/`: ficha de Arannis, navegación entre resumen, grimorio, inventario e historial, controles de vida y recursos, tirada rápida, nota del director y asistente de subida de nivel. La interacción es local para validar UX; la persistencia Supabase queda preparada en `supabase/schema.sql`.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Comprobaciones de producción:

```bash
npm run check
npm run build
```

El adaptador de Vercel genera el despliegue serverless desde Astro.

## Próxima integración

1. Crear un proyecto Supabase y aplicar `supabase/schema.sql`.
2. Añadir `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` al entorno.
3. Sustituir el estado de demostración de `src/pages/index.astro` por consultas Supabase y activar autenticación por correo.
4. Importar el catálogo privado del manual en `rule_entries`, manteniendo las opciones caseras separadas.



# Recursos empleados por agentes
## Habilidades:
### Rendimiento:
- `karpathy-guidelines` (multica-ai/andrej-karpathy-skills)

### Buenas prácticas y patrones de programación:
- `tailwind-css-patterns` (giuseppe-trisciuoglio/developer-kit)
- `typescript-advanced-types` (wshobson/agents)

### Diseño:
- `frontend-design` (anthropics/skills)

## MCPs:
- 

## Herramientas:
- `Codegraph` -> Para ahorrar tokens
- `Improve` -> Para elaborar planes de mejora (Shadcn/improve)
