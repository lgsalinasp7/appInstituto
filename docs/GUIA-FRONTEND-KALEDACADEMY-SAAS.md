# Guía Frontend KaledAcademy SaaS

Esta guía documenta la implementación del frontend de KaledAcademy por fases. Sirve como plantilla para replicar el patrón en otro SaaS o producto vertical.

---

## Resumen de fases

| Fase | Objetivo | Archivos máx. |
|------|----------|---------------|
| 1 | Shell, layouts y navegación | 20 |
| 2 | Estudiante — Dashboard y cursos | 20 |
| 3 | Estudiante — Vista de lección completa | 20 |
| 4 | Estudiante — Progress, Leaderboard, Calendar, Cohort | 20 |
| 5 | Instructor — Dashboard, Estudiantes, Entregables | 20 |
| 6 | Admin — Cursos, Cohorts, Usuarios, Analytics | 20 |
| 7 | Validación final y documentación | — |

**Flujo por fase:** Implementar → `npm run build:vercel` → Corregir errores → Siguiente fase.

---

## Estructura de carpetas

```
src/
├── app/(protected)/academia/
│   ├── student/
│   │   ├── layout.tsx              # StudentSidebar + StudentTopbar
│   │   ├── page.tsx                # Dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx            # Lista de cursos
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Detalle curso (LessonViewer)
│   │   │       └── lesson/[lessonId]/page.tsx  # Vista de lección
│   │   ├── progress/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── calendar/page.tsx
│   │   └── cohort/[cohortId]/page.tsx
│   ├── teacher/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # TeacherDashboard
│   │   ├── students/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   └── messages/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx                # Redirect a analytics
│       ├── analytics/page.tsx
│       ├── courses/page.tsx
│       ├── courses/[id]/page.tsx
│       ├── cohorts/page.tsx
│       ├── users/page.tsx
│       ├── leaderboard/page.tsx
│       └── calendar/page.tsx
│
└── modules/academia/
    ├── components/
    │   ├── student/
    │   │   ├── StudentSidebar.tsx
    │   │   ├── StudentTopbar.tsx
    │   │   ├── StudentDashboardClient.tsx
    │   │   ├── CourseList.tsx
    │   │   ├── LessonViewer.tsx
    │   │   ├── LessonView.tsx
    │   │   ├── LessonViewClient.tsx
    │   │   ├── KaledChat.tsx
    │   │   ├── ProgressView.tsx
    │   │   ├── LeaderboardView.tsx
    │   │   ├── CalendarView.tsx
    │   │   └── CohortView.tsx
    │   ├── teacher/
    │   │   ├── TeacherSidebar.tsx
    │   │   ├── TeacherTopbar.tsx
    │   │   ├── TeacherDashboard.tsx
    │   │   ├── StudentsManagement.tsx
    │   │   └── DeliverablesReview.tsx
    │   └── admin/
    │       ├── AcademyAdminSidebar.tsx
    │       ├── AdminAcademyDashboard.tsx
    │       ├── CoursesManagement.tsx
    │       ├── CohortsManagement.tsx
    │       └── AdminCourseManageView.tsx
    ├── design/
    │   └── tokens.ts
    ├── lib/
    │   └── academy-api.ts          # Helpers fetch
    └── config/
        └── academy-routes.config.ts
```

---

## Rutas de API usadas

**Base:** `/api/academy/` (no `/api/academia/`)

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/academy/courses` | GET | Lista curso bootcamp |
| `/api/academy/courses/[id]/sidebar` | GET | Módulos y lecciones con progreso |
| `/api/academy/lessons/[id]` | GET | Lección con progreso, quizzes, CRAL, entregables |
| `/api/academy/lessons/[id]/complete` | POST | Marcar lección completada |
| `/api/academy/lessons/[id]/video` | POST | Actualizar progreso de video |
| `/api/academy/quizzes/[quizId]/answer` | POST | Enviar respuesta quiz |
| `/api/academy/cral/[challengeId]/complete` | POST | Marcar reto CRAL completado |
| `/api/academy/deliverables/[id]/submit` | POST | Enviar entregable |
| `/api/academy/deliverables/[submissionId]/review` | POST | Revisar entregable (instructor) |
| `/api/academy/cohorts` | GET | Lista cohortes |
| `/api/academy/cohorts/active` | GET | Cohorte activa |
| `/api/academy/cohorts/[id]/ranking` | GET | Ranking de cohorte |
| `/api/academy/cohorts/[id]/analytics` | GET | Analytics de cohorte |
| `/api/academy/cohorts/[id]/deliverables/pending` | GET | Entregables pendientes de revisión |
| `/api/academy/progress` | GET | Progreso por curso |
| `/api/academy/progress/[courseId]` | GET | Progreso de un curso |
| `/api/academy/student/calendar` | GET | Eventos/cohortes para calendario |
| `/api/academy/student/cohort/[cohortId]` | GET | Detalle de cohorte |
| `/api/academy/students` | GET | Lista estudiantes (instructor/admin) |
| `/api/academy/ai/kaled` | POST | Chat con Kaled (streaming) |
| `/api/academy/badges` | GET | Badges del estudiante |

---

## Patrones de diseño

### 1. Shell y layout por rol

- **academy-shell-dark:** Contenedor principal con sidebar + topbar.
- Cada rol (student, teacher, admin) tiene su propio `layout.tsx` que renderiza:
  - Sidebar con navegación
  - Topbar con usuario y menú móvil
  - `{children}` como contenido principal

### 2. Fetch desde cliente

- Los componentes usan `useEffect` + `fetch` para cargar datos.
- Helpers en `academy-api.ts` centralizan las URLs base.
- Las páginas Server Components pueden pasar `cohortId`, `userId` desde `getCurrentUser()` y `prisma`.

### 3. Rutas de páginas

- Estudiante: `/academia/student`, `/academia/student/courses`, `/academia/student/courses/[id]/lesson/[lessonId]`
- Instructor: `/academia/teacher`, `/academia/teacher/students`, etc.
- Admin: `/academia/admin/analytics`, `/academia/admin/courses`, etc.

### 4. Design system

- Clases: `academy-card-dark`, `academy-pill-dark`, `academy-menu-item-active-dark`
- Tokens en `globals.css` y `design/tokens.ts`
- Componentes UI: `@/components/ui` (Card, Button, Dialog, etc.)
- Animaciones: Framer Motion
- Toast: Sonner

### 5. Vista de lección

- `LessonViewClient` obtiene datos de `/api/academy/lessons/[id]` y `/api/academy/courses/[id]/sidebar`.
- Transforma la respuesta al formato esperado por `LessonView`.
- `LessonView` incluye: video, conceptos, CRAL, quiz, entregable, chat Kaled, navegación anterior/siguiente.

---

## Cómo adaptar para otro SaaS

1. **Duplicar estructura:** Copiar `src/app/(protected)/academia/` y `src/modules/academia/` como base.
2. **Renombrar rutas:** Cambiar `/academia/` por tu prefijo (ej. `/mi-producto/`).
3. **Actualizar API base:** Cambiar `/api/academy/` por tu API (ej. `/api/mi-producto/`).
4. **Ajustar roles:** Modificar `academy-routes.config.ts` y layouts según tus roles.
5. **Adaptar diseño:** Sustituir `academy-*` por tus clases y tokens.
6. **Implementar por fases:** Seguir el orden del plan (shell → dashboards → vistas secundarias → admin).

---

## Comandos de validación

```bash
npm run lint
npm run build:vercel
```

Corregir todos los errores antes de dar por finalizada cada fase.
