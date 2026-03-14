---
name: visily-to-nextjs
description: >
  Convert Visily design exports into production Next.js App Router pages for the Amaxoft Admin
  multi-tenant platform. Use when the user provides a Visily export folder path and asks to
  implement a view, page, or component based on a Visily design. Triggers on: (1) References to
  Visily exports or design files, (2) Requests to implement/restyle a page from a Visily design,
  (3) Paths containing Visily-exported App.tsx or similar single-file React apps,
  (4) "implementa la vista de Visily", "convierte el diseno Visily", "restyle con Visily".
---

# Visily to Next.js Conversion

Convert Visily design exports (Vite+React single-file apps) into production-ready Next.js App Router
pages for the Amaxoft Admin platform.

## Workflow

1. **Read the Visily export** - Load the App.tsx (or equivalent) from the user-provided path
2. **Extract main content** - Discard `<aside>` and `<header>`; extract only `<main>` body
3. **Map the design** - Identify layout, colors, components, and data requirements
4. **Find the target page** - Locate the existing Next.js page to restyle (or create new)
5. **Read existing code** - Understand current hooks, state, API calls, submit handlers
6. **Implement** - Rewrite preserving all logic, replacing only styles/layout
7. **Type check** - Run `npx tsc --noEmit`

## Extraction Rules

Visily exports are Vite+React single-file apps with full layout (sidebar + header + main). The
Amaxoft tenant layout already provides sidebar (`TenantSidebar.tsx`) and header (`TenantHeader.tsx`).

**Discard:** `<aside>`, `<header>`, SidebarItem components, external image URLs (use initials/icons).

**Extract:** Everything inside `<main>`, local sub-components, state patterns, color values, layout grids.

## Replacement Tables

See [references/replacements.md](references/replacements.md) for complete icon, font, component, and color mapping tables.

## Page Structure Pattern

Every converted page follows this structure:

```tsx
"use client";

import React, { ... } from "react";
import { useTenant } from "@/shared/components/TenantProvider";
// hooks, types, icons from lucide-react

// ---------- Types ----------
// ---------- Sub-components ----------
// InputField, SelectField, etc. (inline, not separate files)

// ---------- Page ----------
export default function PageName() {
  const { tenantSlug } = useTenant();
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

## Integration Checklist

After visual conversion, ensure backend integration:

1. Identify data requirements from the design
2. Find existing hooks in `src/tenant-apps/adm-restobar/hooks/`
3. Find existing API routes in `src/app/api/tenant/[slug]/`
4. Wire hook data to UI components
5. Preserve all existing handlers (onSubmit, onChange, navigation)
6. Add new fields to formData if Visily shows fields not in current state
7. Preserve TypeScript types; extend existing DTOs if needed

## Multi-Tab / Sub-view Pattern

When Visily shows multiple tab views within a single page/step (e.g., "Plato Menu | Plato de Evento | Crear Plato"):

1. Use `useState` for the active tab key
2. Render a tab bar with blue active indicator (`border-b-[3px] border-[#4b7bec]`)
3. Extract shared components as generics (e.g., `ProductTable<T>`) to avoid duplication across tabs
4. Each tab may use a different hook/data source — wire them independently
5. See `Tab Bar`, `Split Layout`, `Image Upload Drop Zone`, `Category Pills`, and `Skeleton Loading` patterns in `references/replacements.md`

## Overlay Pattern

When Visily shows an overlay/modal triggered by clicks (card, column header, KPI stat):

1. Add state: `useState(false)` for open, `useState<TypeEnum>(default)` for type
2. Filter data with `useMemo` based on selected type
3. Click handler: set type + open
4. Render `<Dialog>` at bottom of page JSX
5. Use colored header banner matching the trigger element's color
6. Follow the existing `KPIOverlay` pattern from `adm-restobar/components/dashboard/KPIOverlay.tsx`

## Verification

After implementation, always:

1. `npx tsc --noEmit` - must pass with zero errors
2. Verify all existing logic (hooks, submit, navigation) is preserved
3. Confirm no unused imports remain
