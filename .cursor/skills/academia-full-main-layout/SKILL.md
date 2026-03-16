---
name: academia-full-main-layout
description: >
  Patrón de layout para que el contenido de pantallas con sidebar (Dashboard, Mi Curso, etc.)
  ocupe todo el área main sin recortes. Usa flexbox con min-h-0 y overflow para que el scroll
  funcione correctamente. Aplicar cuando las vistas se ven cortadas, el contenido no llena el main,
  o al crear nuevas pantallas en layouts con sidebar + topbar (Academia, dashboards).
---

# Layout: Contenido a todo el main (sin recortes)

Patrón usado en KaledAcademy para que Dashboard, Mi Curso, Leaderboard, Calendario y todas las vistas del estudiante ocupen todo el área principal sin quedar recortadas.

## Problema que resuelve

Sin `min-h-0` en contenedores flex, el contenido puede quedar cortado: el main no hace scroll y la vista inferior desaparece. El fix consiste en permitir que los hijos flex se encojan y que el main tenga overflow.

## Estructura del layout

### 1. Shell (contenedor raíz)

```tsx
<div className="academy-shell-dark w-full h-screen flex font-sans relative overflow-hidden">
```

- `h-screen`: altura completa del viewport
- `overflow-hidden`: el scroll ocurre solo en el main, no en el shell

### 2. Sidebar fijo

```tsx
<aside className="hidden lg:flex flex-col w-[260px] shrink-0 ... fixed left-0 top-0 z-30 h-screen">
```

- `shrink-0`: no se encoge
- `fixed`: fuera del flujo; el contenido usa `lg:pl-[260px]` para no quedar debajo

### 3. Wrapper del contenido (crítico)

```tsx
<div className="w-full flex flex-col min-w-0 min-h-0 lg:pl-[260px]">
  <Topbar />
  <MainContent>{children}</MainContent>
</div>
```

**Importante:** `min-w-0 min-h-0` permite que los hijos flex se encojan y hagan overflow. Sin esto, el contenido se recorta.

### 4. Main (área de scroll)

```tsx
<main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
  {children}
</main>
```

- `flex-1`: ocupa el espacio restante
- `min-h-0`: permite que el main se encoja y muestre scroll
- `overflow-y-auto`: scroll vertical cuando el contenido es más alto que el viewport

### 5. MainContent con padding condicional

```tsx
// Para páginas normales (Dashboard, Mi Curso, etc.)
className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8 pb-28 lg:pb-8"

// Para lección (sin padding, contenido a full)
className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-0"
```

### 6. Contenedor del contenido de cada vista

```tsx
<motion.div
  className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8"
>
  {/* Contenido de la página */}
</motion.div>
```

- `w-full`: ancho completo del main
- `max-w-7xl mx-auto`: ancho máximo centrado (1280px)
- `space-y-6 sm:space-y-8`: espaciado vertical entre bloques

## Archivos de referencia

| Archivo | Rol |
|---------|-----|
| `src/app/(protected)/academia/student/layout.tsx` | Layout shell + wrapper |
| `src/app/(protected)/academia/student/MainContent.tsx` | Main con padding condicional |
| `src/modules/academia/components/student/StudentDashboardClient.tsx` | Ejemplo de vista con `w-full max-w-7xl mx-auto` |
| `src/modules/academia/components/student/CohortView.tsx` | Mi Curso |
| `src/modules/academia/components/student/LeaderboardView.tsx` | Leaderboard |
| `src/modules/academia/components/student/CalendarView.tsx` | Calendario |

## Checklist para nuevas vistas

- [ ] El layout padre tiene `min-w-0 min-h-0` en el wrapper del contenido
- [ ] El main tiene `flex-1 overflow-y-auto min-h-0`
- [ ] La vista usa `w-full max-w-7xl mx-auto` como contenedor raíz
- [ ] Si la vista es full-bleed (ej. lección), el main usa `p-0` para esa ruta

## Por qué min-h-0 es crítico

En flexbox, el valor por defecto de `min-height` es `auto`, lo que impide que un hijo flex sea más pequeño que su contenido. Eso bloquea el scroll: el main no puede encogerse y el overflow no aparece. Con `min-h-0`, el hijo puede encogerse y el scroll funciona.
