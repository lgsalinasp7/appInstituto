---
name: visily-to-nextjs
description: >
  Convierte exportaciones de Visily (Vite+React) en páginas Next.js para cualquier proyecto.
  Skill agnóstico: funciona con proyectos Next.js diversos, multi-tenant o single-tenant.
  Se invoca explícitamente cuando el usuario proporciona la ruta de una carpeta exportada desde Visily
  y solicita implementar la vista en su proyecto.
---

# Visily to Next.js Conversion (Agnóstico)

Convierte exportaciones de Visily (Vite+React, `src/App.tsx`) en páginas Next.js listas para producción.
Funciona con cualquier proyecto Next.js; la configuración se infiere del codebase o se pregunta al usuario.

## Workflow

1. **Recibir ruta** - Obtener la ruta de la carpeta exportada (ej. `Downloads/pantallas/DevHub - Bootcamp Dashboard`)
2. **Leer export** - Cargar `src/App.tsx` y estructura del export
3. **Explorar proyecto destino** - Detectar App Router vs Pages Router, layout, UI lib, tenant
4. **Resolver config** - Usar `visily-skill.config.json` si existe; si no, inferir y preguntar lo faltante
5. **Extraer contenido** - Según `discardLayout`: solo `<main>` o diseño completo
6. **Convertir** - Reescribir a página Next.js con componentes del proyecto
7. **Integrar datos** - Conectar hooks, APIs, formularios; crear lo que falte
8. **Verificar** - Ejecutar `npm run build`

## Fase de descubrimiento (híbrida)

### Inferir automáticamente

- **Estructura de rutas**: `src/app/` → App Router; `pages/` → Pages Router
- **Layout propio**: Buscar `layout.tsx`, `TenantProvider`, sidebar/header en layouts
- **Librería UI**: Buscar `components/ui`, imports de shadcn, MUI, Chakra, etc.
- **Multi-tenant**: Buscar `[slug]` en rutas, `useTenant`, `TenantProvider`
- **Patrones de datos**: Prisma, API routes en `app/api/`, hooks en `hooks/`

### Preguntar si no se puede inferir

- Ruta destino de la página (ej. `/dashboard`, `/(protected)/bootcamp`)
- Si descartar sidebar/header del export o incluir todo
- Librería UI si hay varias o ninguna
- Tenant slug si es multi-tenant y no es obvio

## Archivo de configuración opcional

Si existe `visily-skill.config.json` en la raíz del proyecto, usarlo. Ver [references/project-config-schema.md](references/project-config-schema.md).

```json
{
  "uiLibrary": "shadcn",
  "discardLayout": true,
  "iconMapping": "lucide-react",
  "colorPalette": "tailwind",
  "overrides": {
    "icons": { "material-symbols:home": "Home" },
    "colors": { "primary": "#4b7bec" }
  }
}
```

## Reglas de extracción

- **Formato esperado**: Vite + React, `src/App.tsx`
- **Si `discardLayout: true`**: Extraer solo `<main>`, descartar `<aside>`, `<header>`
- **Si `discardLayout: false`**: Incluir diseño completo
- **Imágenes externas**: Reemplazar por placeholders o rutas locales según convención del proyecto

## Mapeo por defecto

- **Iconos**: Iconify → lucide-react (tabla en [references/replacements.md](references/replacements.md))
- **Colores**: Extraer del diseño; usar Tailwind si el proyecto lo usa
- **Fuentes**: Mapear a `font-sans` o la fuente del proyecto

## Integración de datos

1. Identificar en el diseño: formularios, tablas, listas, gráficos
2. Buscar hooks/APIs existentes que coincidan
3. Si no existen: crear hooks + rutas API siguiendo patrones del proyecto
4. Conectar estado y handlers preservando la lógica

## Patrones de conversión

Ver [references/replacements.md](references/replacements.md) para:

- Tab Bar, Split Layout, Image Upload, Category Pills
- Form con secciones, Header con back button
- Stepper, Skeleton Loading, Dialog/Overlay

## Estructura de página típica

```tsx
"use client";

import React, { useState, ... } from "react";
// hooks, tipos, iconos según uiLibrary del proyecto

// ---------- Types ----------
// ---------- Sub-components ----------
// InputField, SelectField, etc. (inline)

// ---------- Page ----------
export default function PageName() {
  // hooks, state, handlers...
  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      {/* Content */}
      {/* Footer actions */}
    </div>
  );
}
```

Para multi-tenant, usar el provider/hook del proyecto (ej. `useTenant()`, `tenantSlug`).

## Modo batch

Si el usuario proporciona una carpeta con múltiples subcarpetas (una vista por subcarpeta):

- Procesar cada una en secuencia
- Aplicar el mismo config a todas
- Preguntar rutas base si no son obvias

## Verificación

Al finalizar, ejecutar `npm run build`. Si falla, reportar errores y corregir antes de dar por terminado.
