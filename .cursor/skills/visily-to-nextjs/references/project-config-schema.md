# Esquema de configuración: visily-skill.config.json

Archivo opcional en la raíz del proyecto para personalizar la conversión Visily → Next.js.

## Ubicación

```
proyecto/
├── visily-skill.config.json   ← aquí
├── src/
├── package.json
└── ...
```

## Esquema

```json
{
  "uiLibrary": "shadcn",
  "discardLayout": true,
  "iconMapping": "lucide-react",
  "colorPalette": "tailwind",
  "overrides": {
    "icons": {},
    "colors": {}
  },
  "baseRoute": "/dashboard",
  "tenantSlug": null
}
```

## Campos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `uiLibrary` | string | inferido | `"shadcn"`, `"mui"`, `"chakra"`, `"tailwind"` (solo Tailwind, sin librería) |
| `discardLayout` | boolean | true | Si `true`, extraer solo `<main>` y descartar sidebar/header del export |
| `iconMapping` | string | `"lucide-react"` | Librería de iconos destino |
| `colorPalette` | string | `"tailwind"` | `"tailwind"` o paleta custom (extraer del diseño) |
| `overrides.icons` | object | `{}` | Mapeo Iconify → nombre de icono destino. Ej: `{"material-symbols:home": "Home"}` |
| `overrides.colors` | object | `{}` | Mapeo token → hex. Ej: `{"primary": "#4b7bec"}` |
| `baseRoute` | string | null | Ruta base para páginas (ej. `/dashboard`). Si null, se infiere o pregunta |
| `tenantSlug` | string \| null | null | Slug del tenant en proyectos multi-tenant. Si null, se infiere o pregunta |

## Ejemplo mínimo

```json
{
  "uiLibrary": "shadcn",
  "discardLayout": true
}
```

## Ejemplo completo

```json
{
  "uiLibrary": "shadcn",
  "discardLayout": true,
  "iconMapping": "lucide-react",
  "colorPalette": "tailwind",
  "overrides": {
    "icons": {
      "material-symbols:home": "Home",
      "material-symbols:dashboard": "LayoutDashboard"
    },
    "colors": {
      "primary": "#4b7bec",
      "primary-hover": "#3a6ad4"
    }
  },
  "baseRoute": "/kaledacademy",
  "tenantSlug": "kaledacademy"
}
```

## Prioridad

1. Valores en `visily-skill.config.json`
2. Inferencia del codebase
3. Pregunta al usuario

Si un campo no está en el config y no se puede inferir, el agente preguntará al usuario.
