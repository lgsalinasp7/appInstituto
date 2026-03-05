# Academia — Vista de Cursos, Cohorte y Tracking de Progreso

Implementado el **04/03/2026** — Build final: OK (exit_code: 0)

---

## Resumen

Se implementó el plan de vista de cursos **fase por fase**, con build tras cada fase y corrección de errores. El resultado incluye:

- **Admin**: Vista de gestión de curso con CRUD de módulos, lecciones y cohortes
- **Estudiante**: Vista "Mi Cohorte" (estilo Henry) con sidebar, barras de progreso y visor de lecciones
- **Integración**: Enlaces a cohorte desde Dashboard, Calendario y Mis Cursos
- **Tracking IA**: Registro de `videoWatchedAt`, `videoProgress` y `timeSpentSec` para futuros agentes

---

## Fases implementadas

### Fase 1 — Schema Prisma

| Cambio | Descripción |
|--------|-------------|
| `AcademyEnrollment.cohortId` | Campo opcional para asociar inscripción a una cohorte |
| `AcademyCohortEvent` | Eventos programados por cohorte |
| `AcademyAssessment`, `AcademyAssessmentResult` | Evaluaciones y resultados |
| `AcademyLessonTask`, `AcademyTaskCompletion` | Tareas de lección |
| `AcademyStudentProgress` ampliado | `videoWatchedAt`, `videoProgress`, `timeSpentSec`, `updatedAt` |

**Archivo:** `prisma/schema.prisma`

---

### Fase 2 — Admin — Vista de gestión de curso

| Componente | Descripción |
|------------|-------------|
| **CoursesManagement** | Botón "Gestionar" en tarjetas de curso → enlace a `/academia/admin/courses/[id]` |
| **AdminCourseManageView** | Pestañas Contenido y Cohortes; CRUD de módulos, lecciones y cohortes (incl. editar cohorte) |
| **Servicios** | `updateModule`, `deleteModule`, `updateLesson`, `deleteLesson` en `AcademyCourseService`; `update`, `delete`, `listEvents`, `createEvent`, `listAssessments`, `createAssessment`, `listMembers` en `AcademyCohortService` |
| **APIs** | `POST/PATCH/DELETE` módulos, lecciones y cohortes; `GET/POST` events y assessments por cohorte; `GET` members |

**Archivos clave:**
- `src/modules/academia/components/admin/CoursesManagement.tsx`
- `src/modules/academia/components/admin/AdminCourseManageView.tsx`
- `src/app/(protected)/academia/admin/courses/[id]/page.tsx`
- `src/modules/academia/services/academy-course.service.ts`
- `src/modules/academia/services/academy-cohort.service.ts`
- `src/app/api/academy/modules/route.ts`, `modules/[id]/route.ts`
- `src/app/api/academy/lessons/route.ts`, `lessons/[id]/route.ts`
- `src/app/api/academy/cohorts/[id]/route.ts`
- `src/app/api/academy/cohorts/[id]/events/route.ts`
- `src/app/api/academy/cohorts/[id]/assessments/route.ts`
- `src/app/api/academy/cohorts/[id]/members/route.ts`

---

### Fase 3 — Estudiante — Vista "Mi Cohorte"

| Componente | Descripción |
|------------|-------------|
| **API** | `GET /api/academy/student/cohort/[cohortId]` — cohorte, curso, módulos, lecciones, eventos, evaluaciones, miembros, progreso |
| **CohortView** | Sidebar: Contenido, Video Feed, Miembros, Datos Académicos, Próximos espacios, Evaluaciones |
| **Progreso** | Barra global y barras por módulo; módulos expandibles; visor de lecciones con marcado de completadas |

**Archivos clave:**
- `src/app/api/academy/student/cohort/[cohortId]/route.ts`
- `src/modules/academia/components/student/CohortView.tsx`
- `src/app/(protected)/academia/student/cohort/[cohortId]/page.tsx`

---

### Fase 4 — APIs y servicios

Cubiertos en Fases 2 y 3. `AcademyCourseService.getById` incluye cohortes y módulos/lecciones sin filtro `isActive`.

---

### Fase 5 — Integración Dashboard y Calendario

| Cambio | Archivo |
|--------|---------|
| Widget "Próxima cohorte" | Enlace a `/academia/student/cohort/[cohortId]` cuando existe `nextCohort` |
| Mis Cursos (summaries) | Enlace a cohorte si `cohortId` presente; si no, a curso |
| Calendario — Próximas cohortes | Cada evento es enlace a `/academia/student/cohort/[id]` |
| Calendario — Detalle día seleccionado | Eventos clickeables a cohorte |
| CourseList (Mis cursos) | Enlace a cohorte si `cohortId`; si no, a curso |
| `AcademyEnrollmentService.listByUser` | Incluye `cohort: { id, name }` |
| `AcademyProgressService.getCourseProgressSummaries` | Incluye `cohortId` en cada resumen |

**Archivos modificados:**
- `src/modules/academia/components/student/StudentDashboard.tsx`
- `src/modules/academia/components/student/CalendarView.tsx`
- `src/modules/academia/components/student/CourseList.tsx`
- `src/modules/academia/services/academy-enrollment.service.ts`
- `src/modules/academia/services/academy-progress.service.ts`
- `src/modules/academia/types/index.ts`

---

### Fase 6 — Barras de progreso y seguimiento IA

| Componente | Descripción |
|------------|-------------|
| **Barras por módulo** | Ya presentes en CohortView (Fase 3) |
| **API** | `PATCH /api/academy/progress/video` — body: `{ lessonId, videoProgress, timeSpentSec }` |
| **Servicio** | `AcademyProgressService.updateVideoProgress` — upsert con `videoWatchedAt`, acumula `timeSpentSec` |
| **VideoProgressTracker** | Componente que envuelve `<video>`; guarda progreso cada 5 s y al terminar |
| **Integración** | CohortView y LessonViewer usan `VideoProgressTracker` en lugar de `<video>` plano |

**Archivos creados/modificados:**
- `src/app/api/academy/progress/video/route.ts` (nuevo)
- `src/modules/academia/components/student/VideoProgressTracker.tsx` (nuevo)
- `src/modules/academia/schemas/index.ts` — `updateVideoProgressSchema`
- `src/modules/academia/services/academy-progress.service.ts` — `updateVideoProgress`
- `src/modules/academia/components/student/CohortView.tsx`
- `src/modules/academia/components/student/LessonViewer.tsx`

---

## Enrollment con cohorte

- `createEnrollmentSchema` incluye `cohortId` opcional.
- Al inscribir, el admin puede enviar `{ userId, courseId, cohortId }` para asignar cohorte.
- Si el enrollment ya existe y se envía `cohortId`, se actualiza el cohorte asignado.

---

## APIs expuestas (nuevas o modificadas)

### `GET /api/academy/student/cohort/[cohortId]`

**Auth:** `ACADEMY_STUDENT | ACADEMY_TEACHER | ACADEMY_ADMIN`

**Respuesta:** cohorte, curso con módulos/lecciones, eventos, evaluaciones, miembros, `completedLessonIds`

---

### `PATCH /api/academy/progress/video`

**Auth:** `ACADEMY_STUDENT`

**Body:**
```json
{
  "lessonId": "uuid",
  "videoProgress": 45,
  "timeSpentSec": 120
}
```

**Descripción:** Actualiza o crea `AcademyStudentProgress` con `videoWatchedAt` (primera vez), `videoProgress` (0–100) y `timeSpentSec` acumulado.

---

### `GET /api/academy/cohorts/[id]/events`

**Auth:** `ACADEMY_STUDENT | ACADEMY_TEACHER | ACADEMY_ADMIN`

**Respuesta:** Lista de eventos del cohorte (`AcademyCohortEvent`).

---

### `POST /api/academy/cohorts/[id]/events`

**Auth:** `ACADEMY_ADMIN`

**Body:** `{ title, type, dayOfWeek?, startTime?, endTime?, scheduledAt? }`

---

### `GET /api/academy/cohorts/[id]/assessments`

**Auth:** `ACADEMY_STUDENT | ACADEMY_TEACHER | ACADEMY_ADMIN`

**Respuesta:** Lista de evaluaciones del cohorte (`AcademyAssessment`).

---

### `POST /api/academy/cohorts/[id]/assessments`

**Auth:** `ACADEMY_ADMIN`

**Body:** `{ title, type, scheduledAt, durationMinutes? }`

---

### `GET /api/academy/cohorts/[id]/members`

**Auth:** `ACADEMY_STUDENT | ACADEMY_TEACHER | ACADEMY_ADMIN`

**Respuesta:** Lista de miembros (usuarios inscritos con `cohortId`).

---

## Rutas de navegación

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/academia/admin/courses/[id]` | ACADEMY_ADMIN | Gestión de curso (módulos, lecciones, cohortes) |
| `/academia/student/cohort/[cohortId]` | ACADEMY_STUDENT | Vista Mi Cohorte |
| `/academia/student/calendar` | ACADEMY_STUDENT | Calendario con enlaces a cohortes |
| `/academia/student/courses` | ACADEMY_STUDENT | Mis cursos (enlace a cohorte o curso según `cohortId`) |

---

## Modelos de datos para agente IA

`AcademyStudentProgress` expone:

- `videoWatchedAt` — primera vez que el usuario vio el video
- `videoProgress` — porcentaje visto (0–100)
- `timeSpentSec` — tiempo total en la lección (segundos acumulados)
- `completed`, `completedAt` — lección marcada como completada

---

## Resultado de checks

| Check | Resultado |
|-------|-----------|
| `npx next build` | OK (exit_code: 0) |
| `npm run lint` | Errores preexistentes en otros archivos; archivos de esta implementación sin errores nuevos |

---

## Notas técnicas

- **Prisma migrate/generate**: En Windows puede fallar por EPERM. Se usó `prisma db push` para el schema; el cliente ya generado permite `next build` sin `prisma generate`.
- **TypeScript**: `schedule` en `AcademyCohortService.update` requiere cast a `Prisma.InputJsonValue`.
- **VideoProgressTracker**: Guarda cada 5 s o al terminar; envía delta de `timeSpentSec`; el backend acumula.
