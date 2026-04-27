# Kaledsoft — Prioridades Actuales

> Fuente de verdad del scope. Mantiene lo que se trabaja AHORA. PO actualiza inmediatamente tras cada decision (Regla 1 sincronia).
> **Ultima auditoria real**: 2026-04-25 (PO sesion inicial, archivo-por-archivo).

---

## Estado General

- **Fecha**: 2026-04-25
- **Mision**: convertir Kaledsoft en SaaS de clase mundial — mejores estandares + mejor seguridad.
- **Auditoria base**: completada. Ver `memory/audit_2026_04_25.md` y `memory/audit_findings_critical.md`.
- **Decisiones pendientes Luis**: (1) commit 38 archivos sistema agentes, (2) destino `nuevaInfraKaledacademy/`, (3) foco proximas 2 semanas.

## Tamano real verificado

- 30 modulos `src/modules/` (~433 archivos)
- 203 API routes (94% con auth wrapper, 5% con logging estructurado real)
- 96 pages (8 violando regla `tenantFetch`)
- 89 modelos Prisma (16 con riesgo aislamiento multi-tenant)
- 27 unit tests + 2 E2E (cobertura E2E real: 0.2%)

## Tenants en produccion

| Slug | Producto | Estado real |
|---|---|---|
| `kaledsoft` | Control plane | Activo, dogfooding |
| `kaledacademy` | Academia + bootcamp | Trabajo activo en contenido (skills sin commitear) |
| `edutec` | Academia | Produccion estable, sin trabajo nuevo |
| `poimensoft` | Academia | Produccion |
| `lavadero-prueba` | Lavadero Pro | Funcional, **0 tests** |

---

## Plan de Ataque por Olas

> Estrategia: tres olas escalonadas. Ola 1 = limpieza + seguridad base (1-2 semanas). Ola 2 = calidad + cobertura (2-3 semanas). Ola 3 = consolidacion + bootcamp (continuo).

### Ola 1 — Estabilizar y Asegurar (P0, 1-2 semanas)

Objetivo: cerrar riesgos de seguridad + sincronizar realidad con docs + commits limpios.

| # | Tarea | Agente | Estado |
|---|---|---|---|
| 1.1 | Commit 38 archivos sistema agentes + skills kaledacademy + docs | PO | DONE `e09c9b8` |
| 1.2 | Mover claves SSH de raiz a `~/.ssh/` (id_github_lgsalinasp, .pub) | Infra | DONE 2026-04-27 — archivadas en `~/.ssh/archive/id_github_lgsalinasp_repo_2026_04_27[.pub]`. NOTA: eran un par DISTINTO al activo en `~/.ssh/` (mismo nombre, fingerprints diferentes), nunca se usaron para git push. |
| 1.3 | gitignore + untrack build_log.txt y build_verify_log.txt | PO | DONE `5e14356` + `b88a556` |
| 1.4 | Eliminar `nuevaInfraKaledacademy/` (decision Luis 2026-04-25: A) | PO | DONE `cc021cc` |
| 1.5 | Eliminar `REFACTOR_PROGRESS.md` y `REFACTOR_COMPLETA_DE_APP.md` (decision Luis 2026-04-25: A) | PO | DONE `cc021cc` |
| 1.6 | **Auditoria aislamiento multi-tenant**: 6 vulnerabilidades P0 confirmadas con rutas de ataque ejecutables. Detalle en `memory/security_multitenant_leaks_2026_04_25.md` | Dev | DONE (sub-agente 2026-04-25) |
| 1.7a | **P0-Sec QUERIES**: 4 fixes aplicados en `fix/multitenant-leak-p0` merged como `a05a760` (commits 20bdb28, 6c12caf, 6dfc22e, 585d826). Dashboard:87 y reports:286+ ya estaban arreglados. Build PASS. | Dev | DONE |
| 1.7b | **P0-Sec SCHEMA academia**: agregar `tenantId String` directo a AcademyLesson (23 queries) + AcademyDeliverableSubmission (14) con backfill | Dev | DONE codigo `50f4d4c` / migracion Neon **pendiente aplicar** (DB sleeping cuando se hizo) |
| 1.8 | **P0-Sec SCHEMA kaled**: tenantId nullable→String obligatorio en KaledLead, PaymentCommitment, KaledEmailLog, KaledCampaign, KaledEmailTemplate, KaledEmailSequence. AgentTask permanece nullable (intencional). | Dev | DONE PR `#26` merged a main `f8ecdae` (commit `0dd2638`) — incluye fix 2 P0 admin (kaled-emails, funnel-analysis) + fallback captureLead a kaledsoft. |
| 1.8b | **Limpieza plantillas seed**: borradas 11 plantillas + 5 secuencias + 14 steps + 45 logs huerfanos en `KaledEmailTemplate`/`Sequence`/`Step`/`Log` (resultado migración 1.8 que renombro plantillas duplicadas). Decision Luis 2026-04-27: opcion A1 quirurgica. Estado final: 12 plantillas, 3 secuencias funcionales (Event Reminders, No-Show Recovery, Sales Sequence - Attended). | PO | DONE via MCP NeonKaledsoft (sin commit, operacion DB) |
| 1.9 | **CI quality gates**: tsc + test bloqueantes + lint informacional en deploy-dev y deploy-prod. Trigger ampliado a pull_request. Validado en run 24956222674 (verde). | Infra | DONE `5b13d3f` |

### Ola 2 — Calidad y Observabilidad (P1, 2-3 semanas)

Objetivo: codigo confiable, debuggeable en produccion, con red de seguridad de tests.

| # | Tarea | Agente | Estado |
|---|---|---|---|
| 2.1 | Migrar 63 API routes con `console.log/error` directo a `logApiStart/Success/Error` (priorizar: webhooks/resend, auth/*, public/aplicar) | Dev | Pendiente |
| 2.2 | Migrar 8 pages de `fetch()` raw a `tenantFetch()` (aplicar, matriculas, reportes, admin/finanzas, auth/change-password, auth/invitation, auth/register, login) | Dev | DONE PR `#31` merged a main `f46aa8f` (commit `4c05e0d`) — 8/8 pages migradas, build PASS, 139/139 tests. |
| 2.3 | Tests unitarios para modulo lavadero (en produccion sin tests) | QA | DONE PR `#29` merged a main `f8f4287` (commit `f4a9f8b`) — 28 tests nuevos (167/167 verde global) cubriendo order/payment/customer/vehicle/dashboard services. Bug detectado: `lavadero-customer.updateCustomer` usa `prisma.update` directo + verifica tenantId post-update (inconsistente con resto). Registrar como tarea Dev futura. |
| 2.4 | Tests unitarios para kaled-crm/KaledLead | QA | Pendiente |
| 2.5 | Tests unitarios para AI/chat (services criticos) | QA | Pendiente |
| 2.6 | E2E: anadir 8 specs criticas (matricula, pago, leccion, kanban lavadero, leaderboard, invitation, recaudo, dashboard) | QA | Pendiente |
| 2.7 | Resolver TODOs reales: N+1 en content.service.ts, dashboard "TODO: Call API", lp/[slug] WhatsApp | Dev | DONE PR `#30` merged a main `07b2075` (commit `5ddd761`) — 3/4 resueltos: N+1 content (2 queries), email tracking kaled-crm (lee `openedAt` del webhook Resend), lp/[slug] WhatsApp desde SystemConfig. Descartado: CarteraView `// TODO: Call API` (era feature work disfrazada — modals stub sin endpoint /api/payment-commitments, registrar como ticket separado). |
| 2.7b | **Feature**: implementar modals de CarteraView (`/api/payment-commitments` endpoint + service + forms) | Dev | Pendiente — surge de 2.7 descarte |
| 2.7c | **Bug**: `lavadero-customer.updateCustomer` valida tenantId despues de update (deberia usar `findFirst` antes como resto del modulo) | Dev | Pendiente — surge de 2.3 |
| 2.8 | Limpiar 70 violaciones residuales `no-explicit-any` en services/components | Dev | Pendiente |
| 2.9 | Estandarizar auth de cron (todas a `CRON_SECRET`) | Infra | Pendiente |
| 2.10 | Configurar CI/CD: lint + type-check + test obligatorios pre-merge a `develop` | Infra | PARCIAL — tsc + test bloqueantes en `deploy-dev.yml`/`deploy-prod.yml` (1.9 DONE). Lint sigue `continue-on-error: true` por 191 lint errors residuales. Lint bloqueante despues de 2.8. |
| 2.11 | Configurar Sentry/observabilidad para errores 5xx | Infra | Pendiente |

### Ola 3 — Consolidacion Estructural (P2, continuo)

Objetivo: reducir superficie de codigo, eliminar dead code, simplificar arquitectura.

| # | Tarea | Agente | Estado |
|---|---|---|---|
| 3.1 | Eliminar modulos vacios: `email-sequences/`, `funnel/`, `prospects/` | PO | Pendiente |
| 3.2 | Migrar 3 leaderboards de `academy/` a `academia/` y eliminar `academy/` | Dev | Pendiente |
| 3.3 | Consolidar dominio financiero: `finance` + `cartera` + `payments` + `receipts` -> 1-2 modulos con boundaries claros | Dev | Pendiente |
| 3.4 | Eliminar `admin/campanas/` y `admin/roles/` (redirects puros) | PO/Dev | Pendiente |
| 3.5 | Dividir `admin/finanzas/page.tsx` (1007 lineas cliente) en sub-componentes | Dev | Pendiente |
| 3.6 | Estandarizar `index.ts` (barrel export) en los 10 modulos que faltan | PO | Pendiente |
| 3.7 | Mover scripts sueltos de raiz a `scripts/` (check-tenants.js, fix-*.mjs, update-edutec-branding-*.ts, etc.) | PO | Pendiente |
| 3.8 | Eliminar 3 versiones duplicadas de `update-edutec-branding` | PO | Pendiente |
| 3.9 | Auditar 10 rutas potencialmente huerfanas y eliminar las realmente sin uso | Dev | Pendiente |
| 3.10 | Reactivar Mintlify docs en deployment o eliminar `mintlify-docs/` | Infra | Pendiente |
| 3.11 | Resolver `/login` vs `/auth/login` duplicados (decidir cual eliminar) | Dev | Pendiente |
| 3.12 | Refactor o eliminar 46 archivos con useMemo/useCallback residuales (React 19) | Dev | Pendiente |

### Bootcamp KaledAcademy (paralelo, P3)

Objetivo: tener oferta de contenido vendible.

| # | Tarea | Agente | Estado |
|---|---|---|---|
| B.1 | Definir primera tanda de modulos a producir (currimulum) | content-creator + Luis | Pendiente |
| B.2 | Producir lecciones (HTML interactivo + quizzes + retos CRAL + ai-criterion + entregable) | content-creator | Pendiente |
| B.3 | Embeber lecciones en seed Prisma | content-creator | Pendiente |

---

## Backlog Cliente (vacio — pendiente input Luis)

Aqui van bugs/features pedidas por clientes reales (edutec, kaledacademy, poimensoft, lavadero-prueba) que bloquean cobro o generan tickets de soporte. Luis debe alimentar.

---

## Operacional permanente

- [ ] `npx prisma generate && npx prisma db push` tras cambios schema.
- [ ] `npm run build` tras cambios significativos (>3 archivos o cambios tipos).
- [ ] CI verde antes de merge a `develop`.
- [ ] Backup Neon -> Google Drive corriendo (workflow `.github/workflows/backup-neon-to-google-drive.yml`).

---

## Reglas

- PO actualiza este archivo INMEDIATAMENTE tras decision (no al final).
- Otros agentes leen pero NO modifican (solo PO escribe aqui).
- Si dudas si algo es prioridad, lo discutes con Luis ANTES de meterlo aqui.
- Tareas se desbloquean en orden de Ola (Ola 1 antes que Ola 2 cuando hay dependencias).
- Trabajo de bootcamp puede correr en paralelo a Olas tecnicas.
