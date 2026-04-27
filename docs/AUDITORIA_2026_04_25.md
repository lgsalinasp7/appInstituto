# Auditoría completa Kaledsoft — 2026-04-25

> Snapshot punto-en-tiempo. Primera auditoría real archivo-por-archivo desde el arranque del sistema de agentes (PO sesión inicial).
> **Fuente**: leyendo el repo carpeta por carpeta, NO los `.md` de progreso (que mienten).
> **Verificar vigencia** antes de citar — algunos hallazgos ya fueron resueltos en olas posteriores (ver `_PRIORITIES.md`).

---

## 1. Tamaño real verificado

- **30 módulos** en `src/modules/` (~433 archivos `.ts`/`.tsx`)
- **203 API routes** en `src/app/api/`
- **96 pages** en `src/app/`
- **89 modelos Prisma**, 7 migraciones (última 2026-04-03)
- **27 tests unitarios** + **2 E2E** (cobertura E2E real: 0.2%)
- **65 docs** en `docs/`

## 2. Discrepancias docs vs realidad

| Documento decía | Realidad verificada | Gap |
|---|---|---|
| Senior Logging 100% (192 rutas) | 11/203 con logger estructurado, 63 con `console.log` directo | 181 rutas sin logging |
| React 19 sin `useMemo`/`useCallback` (100%) | 46+ archivos siguen usándolos | ~50% real |
| TypeScript sin `any` (100%) | Lint reporta ~70 violaciones residuales | ~80% real |
| Playwright E2E completado | 2 specs (login, navigation) sobre 96 pages | 0.2% real |

`REFACTOR_PROGRESS.md` y `REFACTOR_COMPLETA_DE_APP.md` reportaban 100% en cosas al 5%. **Eliminados** en commit `cc021cc`.

## 3. Tenants en producción (verificado)

| Slug | Producto | Estado |
|---|---|---|
| `kaledsoft` | Control plane | Dogfooding |
| `kaledacademy` | Academia + bootcamp | Trabajo activo en contenido |
| `edutec` | Academia | Producción estable |
| `poimensoft` | Academia | Producción |
| `lavadero-prueba` | Lavadero Pro | Funcional, **0 tests** |

---

## 4. Hallazgos P0 — Seguridad / credibilidad

### 4.1 Aislamiento multi-tenant débil (Prisma)

**14 modelos academia** heredan tenant solo vía relación padre, sin `tenantId` directo:
`AcademyModule`, `AcademyLesson`, `AcademyEnrollment`, `AcademyStudentProgress`, `AcademyAssessment`, `AcademyAssessmentResult`, `AcademyQuizOption`, `AcademyDeliverableItem`, `AcademyDeliverableSubmission`, `AcademySaasUpdate`, `AcademyBadgeEarned`, `AcademyCohortLessonRelease`, `AcademyCohortTeacherAssignment`, `AcademyCohortEvent`. También `AiMessage`, `LavaderoOrderService`, `EmailSequenceStep`.

**Modelos con `tenantId` nullable** cuando debería ser obligatorio:
`PaymentCommitment`, `AgentTask`, `KaledLead`, `KaledCampaign`, `KaledEmailTemplate`, `KaledEmailSequence`, `KaledEmailLog`.

**Riesgo**: query `findMany` mal escrito puede leak data entre tenants si no filtra por relación padre.

### 4.2 Vulnerabilidades multi-tenant confirmadas (auditoría 1.6)

Sub-agente Dev verificó queries Prisma sobre 25 modelos en riesgo. **6 vulnerabilidades P0 con rutas de ataque ejecutables**:

| # | Archivo:línea | Leak |
|---|---|---|
| 1 | `src/app/api/academy/ai/kaled/review-code/route.ts:30` | Contenido lección + URLs videos cross-tenant |
| 2 | `src/app/api/academy/ai/kaled/evaluate-deliverable/route.ts:34` | Código estudiante + feedback evaluación |
| 3 | `src/modules/chat/services/session-guard.service.ts:19` | Conteo mensajes cross-tenant |
| 4 | `src/app/api/cron/notifications/route.ts:50,89` | Cron sin contexto tenantId |
| 5 | `src/modules/dashboard/services/dashboard.service.ts:87` | Compromisos pago cross-tenant |
| 6 | `src/modules/reports/services/reports.service.ts:286,290,299,413` | Reportes financieros cross-tenant |

**Estado**: 1.7a aplicó 4 fixes (commit `a05a760`). Pendientes: 1.7b (academia schema parcial) + 1.8 (kaled schema).

#### Migraciones schema pendientes (nullable → obligatorio)

| Modelo | Queries afectadas | Riesgo |
|---|---|---|
| `KaledLead` | 53 | ALTO |
| `PaymentCommitment` | 30 | ALTO |
| `KaledEmailLog` | 30 | ALTO |
| `KaledCampaign` | 19 | ALTO |
| `KaledEmailTemplate` | 13 | MEDIO |
| `KaledEmailSequence` | 3 | BAJO |

`AgentTask` permanece nullable (intencional).

#### Migraciones schema academia (agregar `tenantId` directo)

| Modelo | Queries | Herencia actual |
|---|---|---|
| `AcademyLesson` | 23 | `module → course → tenantId` |
| `AcademyDeliverableSubmission` | 14 | `user → tenantId` |

**Estado**: aplicado en commit `50f4d4c` (mergeado a develop el 2026-04-27).

### 4.3 Claves SSH en raíz del repo

`id_github_lgsalinasp` y `.pub` en `C:\KALEDSOFT\AppInstitutoProvisional\` (NO commiteados, gitignore funciona). **Acción**: mover a `~/.ssh/` (tarea 1.2 — Infra).

### 4.4 `build_log.txt` commiteado en historial

Pese a estar en `.gitignore`, fue trackeado. **Resuelto** en `5e14356` + `b88a556`.

---

## 5. Hallazgos P1 — Deuda técnica con costo operacional

### 5.1 `console.log` directo en 63 API routes

Viola CLAUDE.md regla 5. Peor caso: `webhooks/resend` con 8 violaciones. Lista: `auth/login`, `auth/register`, `auth/me`, `auth/logout`, `auth/forgot-password`, `public/aplicar`, `whatsapp/webhook`, `academy/trial/contact`, `chat/stream`, `cron/*`, `admin/kaled-leads/*`, `admin/campaigns/*`, `admin/email-templates/*`, `payments/recaudo-soporte`, `students/matricula-soporte`, `invitations/*`, `receipts/*`.

### 5.2 Sin tests para módulos en producción

- `lavadero` (en producción, 0 tests)
- AI/chat (0 tests)
- `kaled-crm/KaledLead` (0 tests)
- email automation (0 tests)
- `prospects`, `invitations`, `webhooks` (0 tests)
- academia cohorts (gestión completa sin tests)

### 5.3 Cobertura E2E al 0.2%

Solo `login.spec.ts` y `navigation.spec.ts` sobre 96 pages.

### 5.4 8 pages usan `fetch()` raw (viola CLAUDE.md)

`(marketing)/aplicar`, `(protected)/matriculas`, `(protected)/reportes`, `admin/finanzas`, `auth/change-password`, `auth/invitation/[token]`, `auth/register`, `login`. Migrar a `tenantFetch()`.

### 5.5 TODOs reales en código

- `content/content.service.ts` — N+1 query
- `dashboard/` — 2 componentes con `// TODO: Call API`
- `kaled-crm/` — email tracking sin implementar
- `lp/[slug]/page.tsx:45` — número WhatsApp hardcoded (debería leerse de `SystemConfig`)

---

## 6. Hallazgos P2 — Limpieza estructural

### 6.1 Módulos duplicados o vacíos

- `academy/` (4 archivos legacy) duplica `academia/` (88 archivos). Solo 3 leaderboards lo usan.
- Skeletons vacíos: `email-sequences/`, `funnel/`, `prospects/` (0 archivos).
- Dominio financiero fragmentado: `finance` + `cartera` + `payments` + `receipts` (4 módulos difusos).

### 6.2 Vistas redirect puras (eliminables)

- `admin/campanas/` → redirect a `admin/campaigns/`
- `admin/roles/` → redirect a `admin/configuracion?tab=roles`
- ~10 páginas <30 líneas que son solo redirects

### 6.3 `admin/finanzas/page.tsx` = 1007 líneas (cliente)

Necesita división en sub-rutas o componentes.

### 6.4 Inconsistencia barrel exports

20 módulos tienen `index.ts`, 10 no. Estandarizar.

### 6.5 Scripts sueltos en raíz

`check-tenants.js`, `fix-any-types.mjs`, `test-stream.js`, 3 versiones de `update-edutec-branding`, `verify-email-automation.ts`. Mover a `scripts/`.

---

## 7. Decisiones tomadas (post-auditoría)

| Item | Decisión | Estado |
|---|---|---|
| `nuevaInfraKaledacademy/` (39 días sin tocar) | Eliminar (decisión Luis) | DONE `cc021cc` |
| 38 archivos sin commitear (sistema agentes) | Commitear | DONE `e09c9b8` |
| `REFACTOR_PROGRESS.md` + `REFACTOR_COMPLETA_DE_APP.md` | Eliminar | DONE `cc021cc` |
| `build_log.txt` / `build_verify_log.txt` | Untrack + gitignore | DONE `5e14356`, `b88a556` |

---

## 8. Cómo se usa este documento

- Es **input** para `_PRIORITIES.md` (fuente de verdad operativa).
- **Snapshot 2026-04-25** — verificar archivo:línea antes de actuar (algunos hallazgos ya fueron resueltos).
- **NO usar** `REFACTOR_PROGRESS.md` ni `REFACTOR_COMPLETA_DE_APP.md` (eliminados, eran aspiracionales).
- Para estado actualizado de las olas de trabajo: ver `.claude/commands/kaledsoft/_PRIORITIES.md`.

## 9. Origen

- **Auditor**: PO (Kaledsoft-PO) en sesión inicial 2026-04-25
- **Sub-auditoría 1.6 multi-tenant**: sub-agente Dev background, mismo día
- **Razón**: Luis pidió la verdad sin especulaciones porque sospechaba que los `.md` de progreso no reflejaban la realidad. Confirmado.
