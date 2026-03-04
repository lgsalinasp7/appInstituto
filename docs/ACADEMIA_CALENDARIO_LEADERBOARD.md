# Academia — Calendario de Cohortes y Leaderboard de Progreso

Implementado el **04/03/2026** — Build final: ✅ exitoso (exit_code: 0)

---

## Resumen

Se añadieron dos nuevas secciones al portal de estudiantes de **Kaled Academy**:

| Feature | Ruta | Descripción |
|---|---|---|
| Calendario de Cohortes | `/academia/student/calendar` | Vista mensual con fechas de inicio/fin de cohortes del tenant |
| Leaderboard de Progreso | `/academia/student/leaderboard` | Ranking de estudiantes por lecciones completadas (1 pt = 1 lección) |

Adicionalmente, el `StudentDashboard` incluye dos widgets de acceso rápido a ambas secciones.

---

## Archivos creados / modificados

### FASE 1 — Calendario (3 archivos nuevos + 1 corregido)

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/app/api/academy/student/calendar/route.ts` | Nuevo | API `GET` que lista cohortes del tenant como eventos de calendario |
| `src/modules/academia/components/student/CalendarView.tsx` | Nuevo | Vista mensual con navegación, dots de eventos por día y panel lateral de próximas cohortes |
| `src/app/(protected)/academia/student/calendar/page.tsx` | Nuevo | Thin wrapper que renderiza `CalendarView` |
| `src/modules/academia/components/student/LessonViewer.tsx` | Corregido | Tipos `HTMLElement` y `Module.order` que causaban error de compilación |

### FASE 2 — Leaderboard (5 archivos nuevos + 1 modificado)

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/modules/academia/services/academy-leaderboard.service.ts` | Nuevo | `AcademyLeaderboardService.getLeaderboard(tenantId, userId)` — calcula ranking |
| `src/modules/academia/types/index.ts` | Modificado | Añade `LeaderboardEntry` y `LeaderboardResponse` |
| `src/app/api/academy/student/leaderboard/route.ts` | Nuevo | API `GET` que devuelve el ranking con la posición del usuario actual resaltada |
| `src/modules/academia/components/student/LeaderboardView.tsx` | Nuevo | Podio top-3, widget "Mi posición" y tabla completa con barra proporcional de puntos |
| `src/app/(protected)/academia/student/leaderboard/page.tsx` | Nuevo | Thin wrapper que renderiza `LeaderboardView` |
| `src/modules/academia/index.ts` | Modificado | Exporta `AcademyLeaderboardService` |

### FASE 3 — Integración en Sidebar + Dashboard (3 archivos modificados)

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/modules/academia/config/academy-routes.config.ts` | Modificado | Agrega rutas `/academia/student/calendar` y `/academia/student/leaderboard` al rol `ACADEMY_STUDENT` |
| `src/modules/academia/components/AcademiaSidebar.tsx` | Modificado | Agrega `CalendarDays` y `Trophy` al `iconMap`; corrige tipo `ComponentType` para aceptar `className` |
| `src/modules/academia/components/student/StudentDashboard.tsx` | Modificado | Añade widgets de "Próxima Cohorte" y "Mi Posición" en el dashboard |

---

## APIs expuestas

### `GET /api/academy/student/calendar`

**Auth requerida:** `ACADEMY_STUDENT | ACADEMY_TEACHER | ACADEMY_ADMIN`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Cohorte Enero 2026",
      "courseId": "uuid",
      "courseTitle": "Stack Tecnológico Profesional",
      "startDate": "2026-01-15T00:00:00.000Z",
      "endDate": "2026-05-15T00:00:00.000Z",
      "status": "ACTIVE",
      "schedule": null
    }
  ]
}
```

### `GET /api/academy/student/leaderboard`

**Auth requerida:** `ACADEMY_STUDENT | ACADEMY_TEACHER | ACADEMY_ADMIN`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "userId": "uuid",
        "name": "Ana García",
        "image": null,
        "role": "ACADEMY_STUDENT",
        "points": 42,
        "rank": 1
      }
    ],
    "currentUserEntry": {
      "userId": "uuid",
      "name": "Juan Pérez",
      "image": null,
      "role": "ACADEMY_STUDENT",
      "points": 28,
      "rank": 3
    }
  }
}
```

---

## Arquitectura y notas

### Cálculo de puntos (Leaderboard)
- **Sin migración de BD.** Se agrupan registros de `AcademyStudentProgress` donde `completed = true` por `userId` dentro del `tenantId`.
- **1 punto = 1 lección completada.** Simple, escalable, transparente para el estudiante.
- Todos los usuarios con `platformRole IN (ACADEMY_STUDENT, ACADEMY_TEACHER, ACADEMY_ADMIN)` y `isActive = true` del mismo tenant participan en el ranking.

### Calendario
- Reutiliza el modelo `AcademyCohort` ya existente en BD y el servicio `AcademyCohortService.listByTenant`.
- Sin dependencias externas de calendario (implementación propia con grid CSS).
- Los eventos se muestran como dots de color en el día correspondiente (color según `status`: DRAFT=slate, ACTIVE=cyan, COMPLETED=emerald, CANCELLED=red).

### Diseño
- Coherente con el design system del login de KaledAcademy (glass cards, gradientes radiales, cyan/blue accents).
- Usa `academy-card-dark`, `academy-shell-dark` del CSS global.
- Fuente display (`font-display`) para títulos, `font-semibold`/`font-bold` para contenido.

### Navegación
El sidebar del estudiante muestra ahora 5 ítems:
1. **Inicio** → `/academia/student` — `LayoutDashboard`
2. **Mis Cursos** → `/academia/student/courses` — `BookOpen`
3. **Mi Progreso** → `/academia/student/progress` — `BarChart3`
4. **Calendario** → `/academia/student/calendar` — `CalendarDays`
5. **Leaderboard** → `/academia/student/leaderboard` — `Trophy`

---

## Resultado de checks de calidad

| Check | Resultado |
|---|---|
| FASE 1 — `npm run build:vercel` | ✅ exit_code: 0 |
| FASE 2 — `npm run build:vercel` | ✅ exit_code: 0 |
| FASE 3 — `npx eslint` (archivos nuevos) | ✅ 0 errors, 0 warnings |
| FASE 3 — `npm run build:vercel` final | ✅ exit_code: 0 |

> Los errores de lint del repo pre-existentes están en archivos `tests/modules/**` (uso de `any` en mocks) y no son parte de esta implementación.
