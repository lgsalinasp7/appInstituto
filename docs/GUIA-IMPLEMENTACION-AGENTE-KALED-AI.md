# Guía de Implementación del Agente Kaled AI

Documentación del agente Kaled AI integrado en KaledSoft: tutor que aprende de cada estudiante, alertas al instructor, evaluación de entregables y métricas de cohorte.

---

## Prerrequisitos

### Variables de entorno

- `AI_GATEWAY_API_KEY`: Clave para Vercel AI Gateway (modelos Claude vía gateway)
- `CRON_SECRET`: Secreto para autenticar el cron diario
- `DATABASE_URL`: Conexión a PostgreSQL (Neon)

### Dependencias

- `ai` (Vercel AI SDK)
- `@ai-sdk/gateway` (incluido en `ai`)
- `@ai-sdk/groq` (chat streaming)
- Prisma con los modelos Kaled

---

## Paso a paso por fase

### FASE 0 — Schema Prisma

Modelos añadidos en `prisma/schema.prisma`:

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| `KaledCodeReview` | kaled_code_reviews | Revisiones de código CRAL |
| `KaledStudentErrorPattern` | kaled_student_error_patterns | Memoria de errores por estudiante |
| `KaledInstructorTask` | kaled_instructor_tasks | Alertas/tareas para el instructor |
| `KaledDeliverableEvaluation` | kaled_deliverable_evaluations | Evaluaciones IA de entregables |
| `KaledCohortMetrics` | kaled_cohort_metrics | Snapshots diarios de cohorte |

**Migración:**

```bash
npx prisma db push
# o
npx prisma migrate dev --name add-kaled-agent-tables
```

---

### FASE 1 — Core Engine

Archivos en `src/lib/academia/`:

| Archivo | Función |
|---------|---------|
| `kaled-socratic.ts` | Método socrático, detección de patrones (pide solución, tiene error, validación) |
| `kaled-error-memory.ts` | `updateErrorPatterns()`, `getStudentErrorSummary()`, alertas automáticas |
| `kaled-code-reviewer.ts` | `reviewCodeWithCRAL()` — evalúa código según fase CRAL |
| `kaled-alert-engine.ts` | `runAlertEngine(tenantId)` — genera alertas para el instructor |

---

### FASE 2 — API Routes

| Ruta | Método | Auth | Descripción |
|------|--------|------|-------------|
| `/api/academy/ai/kaled/review-code` | POST | ACADEMY_ROLES | Revisión de código del estudiante |
| `/api/academy/ai/kaled/evaluate-deliverable` | POST | INSTRUCTOR_ROLES | Evaluación IA de entregable |
| `/api/academy/instructor/tasks` | GET, PATCH | INSTRUCTOR_ROLES | Tareas/alertas del instructor |
| `/api/academy/instructor/evaluations` | GET | INSTRUCTOR_ROLES | Evaluaciones pendientes de aprobar |
| `/api/academy/instructor/approve-evaluation` | POST | INSTRUCTOR_ROLES | Aprobar o rechazar evaluación |
| `/api/cron/kaled-daily` | GET | Bearer CRON_SECRET | Cron diario unificado |

**Cron en `vercel.json`:**

```json
{"path": "/api/cron/kaled-daily", "schedule": "0 5 * * *"}
```

- **Todos los días**: snapshot de métricas de cohorte (`KaledCohortMetrics`)
- **Lunes a viernes**: motor de alertas (`runAlertEngine`)

---

### FASE 3 — Frontend

| Componente | Ubicación | Función |
|------------|-----------|---------|
| `KaledAlertPanel` | TeacherDashboard | Lista alertas, botón "Resolver" |
| `EvaluationQueue` | TeacherDashboard | Cola de evaluaciones PENDING_APPROVAL |
| `CodeReviewPanel` | LessonView (Sheet) | Textarea + "Kaled revisa mi código" |

**Integraciones:**

- **TeacherDashboard**: Secciones "Alertas de Kaled" y "Evaluaciones pendientes"
- **LessonView**: Botón "Kaled revisa mi código" debajo de retos CRAL
- **StudentDashboardClient**: Resumen de errores recurrentes y mensaje según fase CRAL

---

## Modelos de IA y costos

| Uso | Modelo | Costo estimado |
|-----|--------|----------------|
| Chat estudiante (streaming) | Groq Llama 3.3 70B | Gratis |
| Code review, evaluación | `anthropic/claude-haiku-4-5` (AI Gateway) | ~$0.001/llamada |

---

## Restricciones Vercel Hobby (Free Tier)

- Cron: mínimo 1 vez al día, precisión ±59 min
- Función: máximo 60 segundos
- 4 crons en total (incluido `kaled-daily`)

---

## Cómo replicar en otro SaaS

1. **Schema**: Copiar los 5 modelos Prisma y relaciones.
2. **Core**: Copiar `lib/academia/*.ts` y adaptar imports.
3. **APIs**: Crear rutas con `withAcademyAuth` o equivalente.
4. **Frontend**: Reutilizar componentes o adaptar a tu UI.
5. **Cron**: Configurar `CRON_SECRET` y añadir entrada en `vercel.json`.
6. **Variables**: `AI_GATEWAY_API_KEY` y `CRON_SECRET`.

---

## Flujo de datos

```
Estudiante → Chat/CodeReview → API → Core Engine → BD
                                    ↓
Instructor ← AlertPanel/EvalQueue ← API ← KaledInstructorTask / KaledDeliverableEvaluation
                                    ↓
Cron diario → runAlertEngine + KaledCohortMetrics
```
