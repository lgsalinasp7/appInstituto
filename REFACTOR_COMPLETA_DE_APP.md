# REFACTORIZACIÓN COMPLETA - AppInstitutoProvisional

> **Auditoría:** 797 archivos | 84,889 líneas | 12 Skills evaluados
> **Fecha:** 2026-04-05
> **Skills base:** `.agent/skills/` (react-19, typescript, senior-logging-pattern, nextjs-15, tailwind-4, zod-4, zustand-5, ai-sdk-5, playwright, vercel, skill-creator)

---

## Resumen Ejecutivo

| # | Skill | Cumplimiento | Archivos a Corregir | Prioridad |
|---|-------|:------------:|:--------------------:|:---------:|
| 1 | **senior-logging-pattern** | 5% | 192 rutas API | CRÍTICA |
| 2 | **react-19** | 30% | 71 archivos | CRÍTICA |
| 3 | **typescript** | 60% | 86 archivos (201 `any`) | ALTA |
| 4 | **playwright** | 0% | Todo el proyecto | ALTA |
| 5 | **nextjs-15** | 75% | ~50 archivos | MEDIA |
| 6 | **zod-4** | 55% | 5 archivos | MEDIA |
| 7 | **tailwind-4** | 95% | ~5 archivos | BAJA |
| 8 | **ai-sdk-5 (v6)** | 95% | 1 archivo | BAJA |
| 9 | **zustand-5** | 100% | 0 | OK |

### Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Total archivos TS/TSX | 797 |
| Total líneas de código | 84,889 |
| Archivos >500 líneas (REFACTORIZAR) | 22 |
| Archivos 300-500 líneas (REVISAR) | 50 |
| Archivos 200-300 líneas | 51 |
| Archivos 100-200 líneas | 144 |
| Archivos <100 líneas | 530 |
| Rutas API totales | 203 |
| Páginas (page.tsx) | 96 |
| Módulos de dominio | 29 |
| Tests unitarios (Vitest) | 23 |
| Tests E2E (Playwright) | 0 |

---

## FASE 1: CORRECCIONES CRÍTICAS (Impacto en producción)

> **Objetivo:** Corregir problemas que afectan directamente el funcionamiento en producción.

### Paso 1.1 - Reemplazar `fetch()` raw por `tenantFetch()`

**Problema:** Componentes client usan `fetch()` sin el header `x-tenant-slug`, rompiendo el aislamiento multi-tenant.

| Archivo | Líneas | Instancias `fetch()` raw | Acción |
|---------|:------:|:------------------------:|--------|
| `src/app/admin/users/UsersClient.tsx` | 440 | 1 + slug hardcoded | Importar `tenantFetch`, eliminar hardcode |
| `src/modules/content/components/ContentManager.tsx` | 307 | 4 | Reemplazar por `tenantFetch()` |
| `src/modules/content/components/ContentDeliveryManager.tsx` | 166 | 2 | Reemplazar por `tenantFetch()` |
| `src/modules/payments/components/PaymentHistory.tsx` | 192 | 1 | Reemplazar por `tenantFetch()` |
| `src/modules/dashboard/components/CarteraView.tsx` | 374 | 2 | Reemplazar por `tenantFetch()` |

**Patrón correcto:**
```typescript
import { tenantFetch } from "@/lib/tenant-fetch";

// ANTES (incorrecto)
const res = await fetch("/api/content");

// DESPUÉS (correcto)
const res = await tenantFetch("/api/content");
```

### Paso 1.2 - Eliminar slug hardcoded `"kaledacademy"`

| Archivo | Línea | Valor hardcoded | Acción |
|---------|:-----:|-----------------|--------|
| `src/app/admin/users/UsersClient.tsx` | ~113 | `"/api/admin/tenants/kaledacademy/invitations"` | Usar slug dinámico del contexto |

### Paso 1.3 - Eliminar `console.log` que exponen datos sensibles

| Archivo | Líneas | Tipo de datos expuestos |
|---------|:------:|------------------------|
| `src/modules/dashboard/components/CarteraView.tsx` | 104, 112 | Datos de pago (studentId, amount) |
| `src/app/api/whatsapp/send-receipt/route.ts` | 48, 102 | Errores de API con tokens |

### Paso 1.4 - Completar TODOs críticos

| Archivo | Línea | TODO pendiente |
|---------|:-----:|----------------|
| `src/modules/dashboard/components/CarteraView.tsx` | ~105 | "TODO: Call API" - Crear compromiso |
| `src/modules/dashboard/components/CarteraView.tsx` | ~113 | "TODO: Call API" - Registrar abono |
| `src/app/admin/users/UsersClient.tsx` | ~101 | "TODO: Connect to backend update" |
| `src/modules/payments/components/PaymentHistory.tsx` | ~22 | Filtro search no implementado |

---

## FASE 2: SENIOR LOGGING PATTERN (192 rutas API)

> **Objetivo:** Implementar logging estructurado con `logApiStart()`, `logApiSuccess()`, `logApiError()` de `@/lib/api-logger` en TODAS las rutas API.
> **Logger ya existe en:** `src/lib/api-logger.ts` (206 líneas, bien implementado)
> **Adopción actual:** Solo 11/203 rutas (5.4%)

**Patrón a implementar en cada ruta:**
```typescript
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const context = { method: "GET", endpoint: "/api/ejemplo", userId, tenantId };
  logApiStart(context);

  try {
    // ... lógica de negocio
    logApiSuccess({ ...context, duration: Date.now() - startTime, metrics: { count: data.length } });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logApiError({ ...context, error, duration: Date.now() - startTime });
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
```

### Paso 2.1 - Rutas de Autenticación (7 rutas)

| Ruta | Líneas | `console.*` actual |
|------|:------:|:------------------:|
| `src/app/api/auth/login/route.ts` | 89 | Sin logging |
| `src/app/api/auth/register/route.ts` | 118 | Sin logging |
| `src/app/api/auth/logout/route.ts` | 14 | Sin logging |
| `src/app/api/auth/forgot-password/route.ts` | 74 | Sin logging |
| `src/app/api/auth/reset-password/route.ts` | 80 | Sin logging |
| `src/app/api/auth/me/route.ts` | 50 | Sin logging |
| `src/app/api/auth/change-password/route.ts` | 57 | Sin logging |

### Paso 2.2 - Rutas de Academia (60 rutas)

| Grupo | Rutas | Líneas (aprox.) |
|-------|:-----:|:---------------:|
| `api/academy/admin/*` | 8 | ~200 |
| `api/academy/ai/*` | 3 | ~164 |
| `api/academy/cohorts/*` | 15 | ~400 |
| `api/academy/courses/*` | 3 | ~50 |
| `api/academy/deliverables/*` | 2 | ~30 |
| `api/academy/enrollments/*` | 1 | 26 |
| `api/academy/instructor/*` | 3 | ~143 |
| `api/academy/lessons/*` | 3 | ~40 |
| `api/academy/modules/*` | 2 | ~30 |
| `api/academy/progress/*` | 3 | ~60 |
| `api/academy/projects/*` | 1 | ~10 |
| `api/academy/quizzes/*` | 1 | ~10 |
| `api/academy/student/*` | 3 | ~40 |
| `api/academy/trial/*` | 2 | 136 |
| `api/academy/badges/route.ts` | 1 | 7 |
| `api/academy/demo-day/*` | 1 | ~10 |

### Paso 2.3 - Rutas de Admin (60+ rutas)

| Grupo | Rutas | Líneas (aprox.) |
|-------|:-----:|:---------------:|
| `api/admin/agents/*` | 10 | ~350 |
| `api/admin/analytics/*` | 3 | ~94 |
| `api/admin/campaigns/*` | 8 | ~300 |
| `api/admin/documents/*` | 2 | ~90 |
| `api/admin/email-templates/*` | 4 | ~250 |
| `api/admin/finance/*` | 4 | ~460 |
| `api/admin/kaled-emails/*` | 1 | 106 |
| `api/admin/kaled-leads/*` | 10 | ~200 |
| `api/admin/products/*` | 3 | ~100 |
| `api/admin/telegram/*` | 1 | 37 |
| `api/admin/tenants/*` | 12 | ~300 |

### Paso 2.4 - Rutas de Lavadero (14 rutas)

| Ruta | Líneas |
|------|:------:|
| `api/lavadero/customers/route.ts` | 30 |
| `api/lavadero/customers/[id]/route.ts` | ~50 |
| `api/lavadero/orders/route.ts` | 34 |
| `api/lavadero/orders/[id]/route.ts` | ~50 |
| `api/lavadero/orders/[id]/status/route.ts` | ~30 |
| `api/lavadero/services/route.ts` | 28 |
| `api/lavadero/services/[id]/route.ts` | ~40 |
| `api/lavadero/vehicles/route.ts` | 37 |
| `api/lavadero/vehicles/[id]/route.ts` | ~40 |
| `api/lavadero/dashboard/route.ts` | 10 |
| `api/lavadero/dashboard/daily-summary/route.ts` | 13 |
| `api/lavadero/payments/route.ts` | 31 |
| `api/lavadero/manifest/route.ts` | 39 |
| `api/lavadero/whatsapp/notify-ready/route.ts` | 33 |

### Paso 2.5 - Rutas Restantes (~60 rutas)

| Grupo | Rutas | Archivos principales |
|-------|:-----:|---------------------|
| `api/cartera/*` | 5 | stats, debts, alerts, summary, route |
| `api/chat/*` | 3 | conversations, stream |
| `api/commitments/*` | 4 | CRUD + paid + reschedule |
| `api/config/*` | 2 | route + [key] |
| `api/content/*` | 5 | CRUD + deliver + pending + student |
| `api/cron/*` | 6 | kaled-daily, keep-alive, reminders, notifications, emails, subscriptions |
| `api/invitations/*` | 3 | route + [id] + accept |
| `api/payments/*` | 5 | route + [id] + stats + today + recaudo-soporte |
| `api/programs/*` | 2 | route + [id] |
| `api/public/*` | 1 | aplicar |
| `api/receipts/*` | 5 | [id] + download + send + whatsapp |
| `api/reports/*` | 8 | dashboard, financial, advisors, etc. |
| `api/roles/*` | 1 | route |
| `api/students/*` | 5 | route + [id] + payments + receipt + matricula |
| `api/tenant/*` | 1 | branding |
| `api/users/*` | 2 | route + [id] |
| `api/webhooks/*` | 1 | resend |
| `api/whatsapp/*` | 3 | send-receipt, templates, webhook |

---

## FASE 3: REACT 19 (71 archivos)

> **Objetivo:** Eliminar patrones obsoletos: `useMemo`, `useCallback`, `React.memo` (el compilador de React 19 lo maneja), `forwardRef` (usar ref como prop), e `import React` (usar named imports).

### Paso 3.1 - Eliminar `useMemo`/`useCallback`/`React.memo` (46 archivos)

#### Grupo A - Módulo Academia (15 archivos)

| Archivo | Líneas | Violación |
|---------|:------:|-----------|
| `src/modules/academia/components/student/LessonView.tsx` | 1506 | useMemo + useCallback |
| `src/modules/academia/components/admin/AdminCourseCohortsOperations.tsx` | 684 | useMemo + useCallback |
| `src/modules/academia/components/student/ProfileView.tsx` | 634 | useMemo |
| `src/modules/academia/components/admin/CohortLessonAccessClient.tsx` | 623 | useCallback |
| `src/modules/academia/components/student/StudentDashboardClient.tsx` | 533 | useMemo + useCallback |
| `src/modules/academia/components/admin/AdminCourseManageView.tsx` | 458 | useMemo |
| `src/modules/academia/components/student/CohortView.tsx` | 439 | useMemo |
| `src/modules/academia/components/admin/AdminCalendarView.tsx` | 418 | useMemo + useCallback |
| `src/modules/academia/components/student/LessonViewClient.tsx` | 338 | useMemo |
| `src/modules/academia/components/student/CalendarView.tsx` | 337 | useMemo |
| `src/modules/academia/components/teacher/StudentsManagement.tsx` | 325 | useCallback |
| `src/modules/academia/components/student/CourseOverview.tsx` | 291 | useMemo |
| `src/modules/academia/components/student/LeaderboardView.tsx` | 249 | useMemo |
| `src/modules/academia/components/admin/CohortsManagement.tsx` | 233 | useMemo |
| `src/modules/academia/components/teacher/EvaluationQueue.tsx` | 169 | useCallback |

#### Grupo B - Módulo Lavadero (4 archivos)

| Archivo | Líneas | Violación |
|---------|:------:|-----------|
| `src/modules/lavadero/components/CustomersView.tsx` | 235 | useMemo |
| `src/modules/lavadero/components/ServicesCatalogView.tsx` | 199 | useMemo |
| `src/modules/lavadero/components/OrdersKanbanView.tsx` | 187 | useMemo + useCallback |
| `src/modules/lavadero/components/BillingView.tsx` | 155 | useMemo |

#### Grupo C - Módulo Dashboard (3 archivos)

| Archivo | Líneas | Violación |
|---------|:------:|-----------|
| `src/modules/dashboard/components/PaymentsHistoryView.tsx` | 695 | useMemo + useCallback |
| `src/modules/dashboard/components/StudentsTable.tsx` | 641 | useMemo |
| `src/modules/dashboard/components/CarteraView.tsx` | 374 | useMemo |

#### Grupo D - Config + Content + Payments (6 archivos)

| Archivo | Líneas | Violación |
|---------|:------:|-----------|
| `src/modules/config/components/UsersManager.tsx` | 702 | useMemo + useCallback |
| `src/modules/payments/components/PaymentRegister.tsx` | 567 | useMemo |
| `src/modules/config/components/ProgramManager.tsx` | 537 | useMemo |
| `src/modules/content/components/ContentManager.tsx` | 307 | useCallback |
| `src/modules/payments/components/PaymentHistory.tsx` | 192 | useMemo |
| `src/modules/content/components/ContentDeliveryManager.tsx` | 166 | useCallback |

#### Grupo E - Otros módulos (4 archivos)

| Archivo | Líneas | Violación |
|---------|:------:|-----------|
| `src/modules/tenants/components/TenantDetailView.tsx` | 1207 | useMemo + useCallback |
| `src/modules/students/components/StudentForm.tsx` | 719 | useMemo |
| `src/modules/tenants/components/TenantsListView.tsx` | 667 | useMemo |
| `src/lib/auth-context.tsx` | 33 | useMemo |

#### Grupo F - Hooks (4 archivos)

| Archivo | Líneas | Violación |
|---------|:------:|-----------|
| `src/hooks/useChat.ts` | 175 | useCallback |
| `src/hooks/useDataFetch.ts` | 81 | useCallback |
| `src/hooks/use-toast.ts` | 36 | useMemo |
| `src/hooks/use-table-pagination.ts` | 27 | useMemo |

#### Grupo G - Páginas Admin/Protected (10 archivos)

| Archivo | Líneas | Violación |
|---------|:------:|-----------|
| `src/app/admin/finanzas/page.tsx` | 967 | useMemo |
| `src/app/admin/campaigns/CampaignsClient.tsx` | 441 | useMemo |
| `src/app/admin/users/UsersClient.tsx` | 440 | useMemo |
| `src/app/admin/email-templates/EmailTemplatesClient.tsx` | 413 | useMemo |
| `src/app/admin/leads/LeadsClient.tsx` | 393 | useMemo |
| `src/app/(protected)/reportes/page.tsx` | 379 | useMemo |
| `src/app/(protected)/matriculas/page.tsx` | 369 | useMemo |
| `src/app/admin/email-templates/analytics/EmailAnalyticsClient.tsx` | 309 | useMemo |
| `src/app/admin/configuracion/ConfigClient.tsx` | 267 | useMemo |
| `src/app/admin/suscripciones/SuscripcionesClient.tsx` | 202 | useMemo |

### Paso 3.2 - Eliminar `forwardRef` (3 archivos)

| Archivo | Líneas | Acción |
|---------|:------:|--------|
| `src/components/ui/popover.tsx` | 25 | Usar `ref` como prop directo |
| `src/components/ui/select.tsx` | 146 | Usar `ref` como prop directo |
| `src/components/ui/tabs.tsx` | 48 | Usar `ref` como prop directo |

### Paso 3.3 - Corregir `import React` (22 archivos)

**Cambiar** `import React from "react"` o `import * as React` **por** named imports.

| Archivo | Líneas | Import actual |
|---------|:------:|---------------|
| `src/components/ui/button.tsx` | 59 | `import React from "react"` |
| `src/components/ui/form.tsx` | 143 | `import * as React` |
| `src/components/ui/popover.tsx` | 25 | `import * as React` |
| `src/components/ui/select.tsx` | 146 | `import * as React` |
| `src/components/ui/tabs.tsx` | 48 | `import * as React` |
| `src/components/ui/dropdown-menu.tsx` | 239 | `import * as React` |
| `src/components/ui/dialog.tsx` | 130 | `import * as React` |
| `src/components/ui/sheet.tsx` | 126 | `import * as React` |
| `src/components/ui/calendar.tsx` | 63 | `import * as React` |
| `src/components/seo/ArticleSchema.tsx` | 57 | `import React` |
| `src/components/seo/LocalBusinessSchema.tsx` | 102 | `import React` |
| `src/components/seo/FAQSchema.tsx` | 28 | `import React` |
| `src/components/seo/BreadcrumbSchema.tsx` | 26 | `import React` |
| `src/modules/receipts/components/ReceiptPDF.tsx` | 409 | `import React` |
| + ~8 archivos adicionales | | |

---

## FASE 4: TYPESCRIPT ESTRICTO (86 archivos, 201 instancias de `any`)

> **Objetivo:** Eliminar TODAS las instancias de `: any` y `as any`. Reemplazar con tipos concretos, `unknown`, generics, o utility types.
> **Skill:** Usar patrón const-types: `const X = {...} as const; type X = (typeof X)[keyof typeof X]`

### Paso 4.1 - Servicios Chat/AI (5 archivos, ~16 `any`)

| Archivo | Líneas | `any` count | Tipos a crear |
|---------|:------:|:-----------:|---------------|
| `src/modules/chat/services/ai-agent.service.ts` | 595 | 5+ | AiAgentCallback, AiAgentResult |
| `src/modules/chat/services/model-provider.service.ts` | 185 | 3+ | AiMessage, AiStreamConfig |
| `src/modules/chat/services/rag.service.ts` | 193 | 3+ | RagEmbedding, RagChunk |
| `src/modules/chat/services/chat.service.ts` | 191 | 2+ | ChatParams |
| `src/modules/chat/services/ai-tools.service.ts` | 257 | 3+ | ToolDefinition |

### Paso 4.2 - Servicios CRM (4 archivos, ~18 `any`)

| Archivo | Líneas | `any` count | Tipos a crear |
|---------|:------:|:-----------:|---------------|
| `src/modules/kaled-crm/services/kaled-automation.service.ts` | 445 | 5+ | AutomationRule, AutomationAction |
| `src/modules/kaled-crm/services/kaled-analytics.service.ts` | 408 | 4+ | AnalyticsMetric, AnalyticsFilter |
| `src/modules/kaled-crm/services/kaled-email.service.ts` | 387 | 5+ | EmailPayload, EmailResult |
| `src/modules/kaled-crm/services/kaled-campaign.service.ts` | 363 | 4+ | CampaignData, CampaignMetrics |

### Paso 4.3 - Servicios Academy (3 archivos, ~15 `any`)

| Archivo | Líneas | `any` count |
|---------|:------:|:-----------:|
| `src/modules/academy/services/academy.service.ts` | 1279 | 8+ |
| `src/modules/academy/api/handlers.ts` | 551 | 5+ |
| `src/modules/academia/services/academy-cohort.service.ts` | 722 | 2+ |

### Paso 4.4 - Componentes Dashboard (5 archivos, ~12 `any`)

| Archivo | Líneas | `any` count |
|---------|:------:|:-----------:|
| `src/modules/dashboard/components/PaymentsHistoryView.tsx` | 695 | 3+ |
| `src/modules/dashboard/components/StudentsTable.tsx` | 641 | 2+ |
| `src/modules/dashboard/components/CarteraView.tsx` | 374 | 5 |
| `src/modules/dashboard/components/PaymentModal.tsx` | 384 | 1+ |
| `src/modules/dashboard/services/dashboard.service.ts` | 170 | 1+ |

### Paso 4.5 - Rutas API (15+ archivos, ~30 `any`)

| Archivo | Líneas | `any` count |
|---------|:------:|:-----------:|
| `src/app/api/invitations/route.ts` | 411 | 3+ |
| `src/app/api/invitations/accept/route.ts` | 406 | 3+ |
| `src/app/api/chat/stream/route.ts` | 371 | 3+ |
| `src/app/api/cron/process-kaled-emails/route.ts` | 165 | 2+ |
| `src/app/api/admin/campaigns/route.ts` | 83 | 1+ |
| + ~10 rutas adicionales | | |

### Paso 4.6 - Librerías y utilidades (8 archivos, ~15 `any`)

| Archivo | Líneas | `any` count |
|---------|:------:|:-----------:|
| `src/lib/errors.ts` | 246 | 4 |
| `src/lib/api-auth.ts` | 354 | 2+ |
| `src/lib/email.ts` | 424 | 3+ |
| `src/lib/auth.ts` | 221 | 2+ |
| `src/lib/api-context.ts` | 134 | 2+ |
| + ~3 archivos más | | |

### Paso 4.7 - Tipos incompletos (5 archivos, ~10 `any`)

| Archivo | Líneas | Problema |
|---------|:------:|---------|
| `src/modules/kaled-crm/types/index.ts` | 323 | Tipos con `any` en propiedades |
| `src/modules/students/types/index.ts` | 157 | Algunos campos `any` |
| `src/modules/agents/types/index.ts` | 184 | Tipos parciales |

### Paso 4.8 - Componentes restantes (~40 archivos, ~100 `any`)

Revisión y corrección de todos los `any` restantes en componentes client, modales, formularios y utilidades.

---

## FASE 5: REFACTORIZACIÓN DE ARCHIVOS GRANDES (22 archivos >500 líneas)

> **Objetivo:** Ningún archivo debe superar las 400 líneas. Split en subcomponentes, sub-servicios o archivos auxiliares.

### Paso 5.1 - `LessonView.tsx` (1506 líneas -> ~5 archivos de ~300)

**Ruta:** `src/modules/academia/components/student/LessonView.tsx`

| Archivo nuevo | Responsabilidad | Líneas est. |
|---------------|----------------|:-----------:|
| `LessonView.tsx` | Contenedor principal, routing interno | ~200 |
| `LessonContent.tsx` | Renderizado de contenido de lección | ~300 |
| `LessonSidebar.tsx` | Sidebar de navegación entre lecciones | ~250 |
| `LessonInteractive.tsx` | Elementos interactivos y animaciones | ~350 |
| `LessonQuiz.tsx` | Quizzes y evaluaciones inline | ~300 |

### Paso 5.2 - `academy.service.ts` (1279 líneas -> 4-5 archivos)

**Ruta:** `src/modules/academy/services/academy.service.ts`

| Archivo nuevo | Responsabilidad | Líneas est. |
|---------------|----------------|:-----------:|
| `academy-lesson.service.ts` | CRUD de lecciones | ~300 |
| `academy-quiz.service.ts` | Gestión de quizzes | ~200 |
| `academy-deliverable.service.ts` | Entregables | ~250 |
| `academy-admin.service.ts` | Operaciones admin | ~300 |
| `academy.service.ts` | Barrel export + coordinación | ~200 |

### Paso 5.3 - `TenantDetailView.tsx` (1207 líneas -> 4-5 archivos)

**Ruta:** `src/modules/tenants/components/TenantDetailView.tsx`

| Archivo nuevo | Responsabilidad | Líneas est. |
|---------------|----------------|:-----------:|
| `TenantDetailView.tsx` | Contenedor con tabs | ~150 |
| `TenantInfoTab.tsx` | Información general | ~250 |
| `TenantUsersTab.tsx` | Gestión de usuarios del tenant | ~300 |
| `TenantBrandingTab.tsx` | Configuración de marca | ~250 |
| `TenantStatsTab.tsx` | Estadísticas del tenant | ~250 |

### Paso 5.4 - `AdminLessonEditorDialog.tsx` (1139 líneas -> 3-4 archivos)

**Ruta:** `src/modules/academia/components/admin/AdminLessonEditorDialog.tsx`

| Archivo nuevo | Responsabilidad | Líneas est. |
|---------------|----------------|:-----------:|
| `AdminLessonEditorDialog.tsx` | Dialog container | ~200 |
| `LessonEditorForm.tsx` | Formulario de edición | ~350 |
| `LessonEditorPreview.tsx` | Preview del contenido | ~300 |
| `LessonEditorConfig.tsx` | Configuración avanzada | ~300 |

### Paso 5.5 - `finanzas/page.tsx` (967 líneas -> componentes)

**Ruta:** `src/app/admin/finanzas/page.tsx`

| Archivo nuevo | Responsabilidad | Líneas est. |
|---------------|----------------|:-----------:|
| `page.tsx` | Server component, data fetching | ~50 |
| `FinanzasClient.tsx` | Client container | ~300 |
| `FinanzasDashboard.tsx` | Dashboard cards y stats | ~300 |
| `FinanzasCharts.tsx` | Gráficas (Recharts) | ~250 |

### Paso 5.6 - Archivos restantes 500-700 líneas (17 archivos)

| Archivo | Líneas | Split propuesto |
|---------|:------:|-----------------|
| `academy-cohort.service.ts` | 722 | Split por operación (CRUD, analytics, members) |
| `StudentForm.tsx` | 719 | Split en steps/secciones |
| `UsersManager.tsx` | 702 | Extraer tabla + modales |
| `PaymentsHistoryView.tsx` | 695 | Extraer filtros + tabla + modales |
| `AdminCourseCohortsOperations.tsx` | 684 | Split por operación |
| `TenantsListView.tsx` | 667 | Extraer tabla + modales |
| `StudentsTable.tsx` | 641 | Extraer modales y filtros |
| `ProfileView.tsx` | 634 | Split en secciones |
| `CohortLessonAccessClient.tsx` | 623 | Split en tabla + acciones |
| `payment.service.ts` | 620 | Split por operación |
| `ai-agent.service.ts` | 595 | Separar tracking de lógica |
| `PaymentRegister.tsx` | 567 | Split en steps |
| `tenants.service.ts` | 561 | Split por dominio |
| `handlers.ts` | 551 | Split por entidad |
| `viaje-url-builders.ts` | 547 | Modularizar por sección |
| `ProgramManager.tsx` | 537 | Extraer lista + form + modales |
| `StudentDashboardClient.tsx` | 533 | Split en widgets |

---

## FASE 6: NEXT.JS 15 (~50 archivos nuevos/modificados)

> **Objetivo:** Cumplir con convenciones de Next.js 15 App Router: loading states, error boundaries, server-only, metadata.

### Paso 6.1 - Crear `loading.tsx` (~40 archivos)

**Template base:**
```tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-64 rounded bg-muted" />
    </div>
  );
}
```

| Directorio | loading.tsx a crear |
|------------|:-------------------:|
| `src/app/(protected)/dashboard/` | 1 |
| `src/app/(protected)/matriculas/` | 1 |
| `src/app/(protected)/reportes/` | 1 |
| `src/app/(protected)/recaudos/` | 1 |
| `src/app/(protected)/configuracion/` | 1 |
| `src/app/(protected)/pipeline/` | 1 |
| `src/app/(protected)/prospectos/` | 1 |
| `src/app/(protected)/finanzas/` | 1 |
| `src/app/(protected)/lavadero/admin/dashboard/` | 1 |
| `src/app/(protected)/lavadero/admin/orders/` | 1 |
| `src/app/(protected)/lavadero/admin/customers/` | 1 |
| `src/app/(protected)/lavadero/admin/billing/` | 1 |
| `src/app/(protected)/lavadero/admin/services/` | 1 |
| `src/app/(protected)/lavadero/supervisor/dashboard/` | 1 |
| `src/app/(protected)/lavadero/supervisor/orders/` | 1 |
| `src/app/(protected)/academia/admin/analytics/` | 1 |
| `src/app/(protected)/academia/admin/calendar/` | 1 |
| `src/app/(protected)/academia/admin/cohorts/` | 1 |
| `src/app/(protected)/academia/admin/courses/` | 1 |
| `src/app/(protected)/academia/admin/deliverables/` | 1 |
| `src/app/(protected)/academia/admin/leaderboard/` | 1 |
| `src/app/(protected)/academia/admin/operations/` | 1 |
| `src/app/(protected)/academia/admin/users/` | 1 |
| `src/app/(protected)/academia/teacher/calendar/` | 1 |
| `src/app/(protected)/academia/teacher/courses/` | 1 |
| `src/app/(protected)/academia/teacher/leaderboard/` | 1 |
| `src/app/(protected)/academia/teacher/messages/` | 1 |
| `src/app/(protected)/academia/teacher/students/` | 1 |
| `src/app/admin/` (15+ subrutas) | 15 |
| **Total** | **~40** |

### Paso 6.2 - Crear `error.tsx` (5 archivos)

**Template base:**
```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">Algo salió mal</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded bg-primary px-4 py-2 text-white">
        Intentar de nuevo
      </button>
    </div>
  );
}
```

| Ruta | Prioridad |
|------|:---------:|
| `src/app/(protected)/academia/error.tsx` | ALTA |
| `src/app/(protected)/lavadero/error.tsx` | ALTA |
| `src/app/admin/error.tsx` | ALTA |
| `src/app/(marketing)/error.tsx` | MEDIA |
| `src/app/auth/error.tsx` | MEDIA |

### Paso 6.3 - Agregar `import "server-only"` (~28 archivos)

| Archivo | Líneas | Justificación |
|---------|:------:|---------------|
| `src/lib/auth.ts` | 221 | Maneja sesiones server-side |
| `src/lib/api-auth.ts` | 354 | Auth wrappers para API |
| `src/lib/prisma.ts` | 71 | Cliente de base de datos |
| `src/lib/email.ts` | 424 | Envío de emails |
| `src/lib/api-logger.ts` | 206 | Logger del servidor |
| `src/modules/*/services/*.ts` | ~24 files | Toda la capa de servicios |

### Paso 6.4 - Evaluar creación de `middleware.ts`

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `src/middleware.ts` | NO EXISTE | Crear para extraction automática de tenant slug desde subdomain |

---

## FASE 7: ZOD 4 (5 archivos de schemas)

> **Objetivo:** Migrar de patrones Zod v3 a v4.

| Archivo | Líneas | Patrón v3 actual | Patrón v4 correcto |
|---------|:------:|------------------|---------------------|
| `src/modules/auth/schemas/index.ts` | 40 | `z.string().email("msg")` (3x) | `z.email("msg")` |
| `src/modules/lavadero/schemas/index.ts` | 48 | `z.string().email("msg")` (1x) | `z.email("msg")` |
| `src/modules/masterclass/schemas/index.ts` | 36 | `z.string().email("msg")` (1x) | `z.email("msg")` |
| `src/modules/students/schemas/index.ts` | 59 | `z.string().email("msg")` (2x) | `z.email("msg")` |
| `src/modules/academia/schemas/index.ts` | 99 | `message:` en validadores | `error:` |

---

## FASE 8: PLAYWRIGHT E2E TESTS (nuevo)

> **Objetivo:** Implementar testing E2E con Playwright siguiendo el skill `playwright`.
> **Estado actual:** 0 tests E2E. Solo 23 tests unitarios con Vitest.

### Paso 8.1 - Setup inicial

```bash
npm install -D @playwright/test
npx playwright install
```

| Archivo a crear | Descripción |
|----------------|-------------|
| `playwright.config.ts` | Configuración de Playwright |
| `tests/e2e/base-page.ts` | BasePage object (clase padre) |
| `tests/e2e/helpers.ts` | Utilidades compartidas |

### Paso 8.2 - Page Objects

| Archivo | Responsabilidad |
|---------|----------------|
| `tests/e2e/pages/login-page.ts` | Login flow |
| `tests/e2e/pages/dashboard-page.ts` | Dashboard navigation |
| `tests/e2e/pages/student-page.ts` | Student flows |
| `tests/e2e/pages/admin-page.ts` | Admin operations |
| `tests/e2e/pages/lavadero-page.ts` | Lavadero flows |

### Paso 8.3 - Tests E2E críticos

| Test file | Flows cubiertos | Tags |
|-----------|-----------------|------|
| `tests/e2e/auth/login.spec.ts` | Login, logout, session | `@critical @auth` |
| `tests/e2e/auth/register.spec.ts` | Registro, validación | `@critical @auth` |
| `tests/e2e/dashboard/navigation.spec.ts` | Nav sidebar, breadcrumbs | `@e2e @dashboard` |
| `tests/e2e/academia/student-flow.spec.ts` | Ver cursos, lecciones, progreso | `@critical @academia` |
| `tests/e2e/academia/admin-flow.spec.ts` | CRUD cohorts, courses | `@e2e @academia` |
| `tests/e2e/lavadero/order-flow.spec.ts` | Crear orden, kanban, pago | `@critical @lavadero` |

### Paso 8.4 - Documentación de tests

| Doc file | Contenido |
|----------|-----------|
| `tests/e2e/auth/login.md` | Casos de test del login (max 60 líneas) |
| `tests/e2e/academia/student-flow.md` | Casos del flujo estudiante |

---

## FASE 9: OPTIMIZACIONES FINALES

### Paso 9.1 - Resolver N+1 Queries

| Archivo | Líneas | Problema | Solución |
|---------|:------:|---------|----------|
| `src/modules/content/services/content.service.ts` | 264 | `getPendingDeliveries()` hace N queries en loop | Batch con `groupBy` + single query |
| `src/modules/academy/services/academy.service.ts` | 1279 | Queries complejas posibles N+1 | Revisar `include` y `select` de Prisma |

### Paso 9.2 - Eliminar valores hardcoded

| Archivo | Línea | Valor | Solución |
|---------|:-----:|-------|----------|
| `src/app/admin/users/UsersClient.tsx` | ~113 | `"kaledacademy"` | Slug dinámico del contexto |
| `src/modules/dashboard/services/dashboard.service.ts` | ~137 | `10000000` (meta mensual) | Mover a tabla `Config` |
| `src/modules/dashboard/components/CarteraView.tsx` | ~264 | `"57"` (código país) | Constante `COUNTRY_CODE_CO` |

### Paso 9.3 - Evaluar migración de `useChat` custom

| Archivo | Líneas | Estado actual | Evaluación |
|---------|:------:|--------------|------------|
| `src/hooks/useChat.ts` | 175 | Custom con `fetch()` + `TextDecoder` | Evaluar migración a `@ai-sdk/react` |

---

## Checklist de Verificación Final

| # | Check | Comando | Resultado esperado |
|---|-------|---------|-------------------|
| 1 | TypeScript compila | `npx tsc --noEmit` | 0 errores |
| 2 | Tests unitarios | `npx vitest run` | Todos pasan |
| 3 | Build Next.js | `npx next build` | Build exitoso |
| 4 | Cero `any` | `grep -r ": any\|as any" src/ --include="*.ts" --include="*.tsx"` | 0 resultados |
| 5 | Cero memo manual | `grep -r "useMemo\|useCallback\|React.memo" src/ --include="*.tsx"` | 0 resultados |
| 6 | Cero console en API | `grep -r "console.log\|console.error" src/app/api/ --include="*.ts"` | 0 resultados |
| 7 | Cero import React | `grep -r "import React from\|import \* as React" src/ --include="*.tsx"` | 0 resultados |
| 8 | Cero forwardRef | `grep -r "forwardRef" src/ --include="*.tsx"` | 0 resultados |
| 9 | Tests E2E | `npx playwright test` | Todos pasan |
| 10 | Cero fetch raw | `grep -r "await fetch(" src/modules/ src/app/admin/ --include="*.tsx"` | 0 resultados en clients |

---

## Resumen de Esfuerzo por Fase

| Fase | Descripción | Archivos | Estimación |
|:----:|-------------|:--------:|:----------:|
| 1 | Correcciones críticas | 10 | Pequeña |
| 2 | Senior Logging (192 rutas) | 192 | Grande |
| 3 | React 19 (memo, forwardRef, imports) | 71 | Media |
| 4 | TypeScript estricto (201 `any`) | 86 | Grande |
| 5 | Refactorización archivos grandes | 22 | Grande |
| 6 | Next.js 15 (loading, error, server-only) | ~50 | Media |
| 7 | Zod 4 schemas | 5 | Pequeña |
| 8 | Playwright E2E tests | ~15 nuevos | Media |
| 9 | Optimizaciones finales | ~5 | Pequeña |
| **TOTAL** | | **~456 archivos** | |
