# Pre-Auditoría 1.8 — `tenantId` NOT NULL en modelos Kaled* + PaymentCommitment

> Owner: PO Kaledsoft (sub-agente)
> Fecha: 2026-04-27
> Branch base: `develop`
> Migración modelo: `prisma/migrations/20260425120000_add_tenantid_to_academy_lesson_and_submission/migration.sql`

---

## 0. Resumen ejecutivo

- **Total NULLs en producción: 17** (sobre 144 rows en los 6 modelos).
- **Backfill 100% determinable** sin intervención manual: PaymentCommitment via `student.tenantId`; resto al tenant `kaledsoft` (`cmm6rb5c10000vsl0hr6xam62`).
- **Archivos a tocar (FIX): 4** rutas de alto riesgo + Prisma schema. **REVIEW: 4** archivos. **OK: 19** archivos (ya filtran por tenant).
- **Riesgo P0 detectado**: dos endpoints de admin (`/api/admin/kaled-emails`, `/api/admin/agents/kaled/funnel-analysis`) hacen queries SIN filtro `tenantId` → leak cross-tenant cuando lleguen los segundos clientes Kaled CRM. El webhook de Resend (`/api/webhooks/resend`) busca `kaledEmailLog` solo por `resendId` (collision-safe pero sin tenant assertion).
- **Estimación Dev: 6–8 horas** (audit fixes + schema + migración + smoke E2E).

---

## 1. Conteos en Neon (producción)

**Proyecto / branch utilizado**: el MCP Neon no exponía la DB de este repo (los proyectos visibles bajo `org-summer-bar-49058626` corresponden a `amaxoft-admin`, no a `AppInstitutoProvisional`). Las queries se ejecutaron contra el host real declarado en `.env`:

```
ep-billowing-dream-anjlrgrr-pooler.c-6.us-east-1.aws.neon.tech / neondb
```

(Driver: `@neondatabase/serverless` invocado vía Node con la `DATABASE_URL` del repo. Es la DB de producción que sirve hoy a `kaledacademy`, `kaledsoft`, `edutec`, `poimensoft` y `lavadero-prueba`.)

### 1.1 NULLs por modelo

| Modelo                | Total rows | NULLs | % NULL |
|-----------------------|-----------:|------:|-------:|
| KaledLead             |         28 |     1 |  3.6%  |
| PaymentCommitment     |         39 |     1 |  2.6%  |
| KaledEmailLog         |         45 |     0 |  0%    |
| KaledCampaign         |          1 |     0 |  0%    |
| KaledEmailTemplate    |         23 |    11 | 47.8%  |
| KaledEmailSequence    |          8 |     4 | 50.0%  |
| **Total**             |    **144** |**17** |        |

### 1.2 Tenants registrados

| Slug             | id                              | Nota                                |
|------------------|---------------------------------|-------------------------------------|
| `edutec`         | `cmlv08zcg0000vst88b39ztk5`     | Owner del PaymentCommitment huérfano|
| `kaledacademy`   | `cmm76nr4a0000vstwszautln3`     |                                     |
| `kaledsoft`      | `cmm6rb5c10000vsl0hr6xam62`     | **Owner CRM Kaled** (target backfill)|
| `lavadero-prueba`| `cmmh809e80000l20463uppz28`     |                                     |
| `poimensoft`     | `cmm7s7zca0000vsrwrvidppps`     |                                     |

### 1.3 Detalle de filas huérfanas (verificado fila-a-fila)

- **PaymentCommitment NULL** (1): id `cmm2di1kv0003vsq45fsn01tr` → su `Student` tiene `tenantId = cmlv08zcg0000vst88b39ztk5` (edutec). Backfill via JOIN a `Student`.
- **KaledLead NULL** (1): `jimenezdoris292@gmail.com`, source `MASTERCLASS: masterclass-ia`, creado 2026-03-01 (antes de que el captura del webhook resolviera tenant). Distribución global: 27/28 = `kaledsoft`. Asignar el huérfano a `kaledsoft`.
- **KaledEmailTemplate NULL** (11): todos `isLibraryTemplate = true`, categoría `AUTOMATIC`, fechas `2026-03-01` (seed inicial CRM). Asignar a `kaledsoft` (dueño del CRM Kaled).
- **KaledEmailSequence NULL** (4): "Funnel Citas - CONTACTADO", "Event Reminders", "Sales Sequence - Attended", "No-Show Recovery". Mismo origen seed. Asignar a `kaledsoft`.
- **KaledEmailLog**: 0 NULLs (no requiere backfill).
- **KaledCampaign**: 0 NULLs (no requiere backfill).

---

## 2. Estrategia de backfill (decisión)

| Modelo                | Estrategia                                                                 | Justificación |
|-----------------------|-----------------------------------------------------------------------------|---------------|
| **PaymentCommitment** | `UPDATE pc SET tenantId = s.tenantId FROM Student s WHERE s.id = pc.studentId` | Cada compromiso pertenece al tenant del estudiante. Determinístico. |
| **KaledLead**         | `UPDATE SET tenantId = '<kaledsoft>' WHERE tenantId IS NULL`                | 27/28 ya pertenecen a kaledsoft; el huérfano es un capture pre-tenant. Único cliente CRM Kaled hoy. |
| **KaledEmailTemplate**| `UPDATE SET tenantId = '<kaledsoft>' WHERE tenantId IS NULL`                | Plantillas seed iniciales del CRM. Pertenecen al dueño del producto. |
| **KaledEmailSequence**| `UPDATE SET tenantId = '<kaledsoft>' WHERE tenantId IS NULL`                | Idem plantillas. Las 4 secuencias son flujos genéricos del producto. |
| **KaledEmailLog**     | (no aplica, 0 NULLs)                                                        | — |
| **KaledCampaign**     | (no aplica, 0 NULLs)                                                        | — |

**Riesgo cero** de mover datos de un tenant a otro: ningún modelo Kaled* tiene rows pertenecientes a tenants distintos a kaledsoft hoy.

---

## 3. Auditoría de queries (priorizada por riesgo)

> Convención: **OK** = ya filtra por `tenantId` en where/data; **FIX** = no filtra y debe agregarse; **REVIEW** = filtrado parcial o derivado, requiere mirada de Dev al hacer la migración.

### 3.1 ALTO RIESGO — API routes y services con escritura/lectura sensible

| Archivo : línea(s)                                                                 | Modelo(s)                | Tipo  | Estado | Nota |
|---|---|---|---|---|
| `src/app/api/admin/kaled-emails/route.ts:35,58–91`                                  | KaledEmailLog            | read  | **FIX**    | `where` arranca como `{}`. No filtra por tenant. Cuando exista un segundo CRM, filtrará todo. Agregar `tenantId` desde `withPlatformAdmin` o desde el admin context. |
| `src/app/api/admin/agents/kaled/funnel-analysis/route.ts:10–28`                     | KaledLead, KaledCampaign | read  | **FIX**    | `groupBy` y `findMany` sin `tenantId`. Mismo problema multi-tenant futuro. |
| `src/app/api/cron/process-kaled-emails/route.ts:28–37,104,126,141`                  | KaledEmailLog, KaledLead | read/write | REVIEW | Cron procesa todos los logs PENDING. Aceptable si el cron es global; sin embargo después de NOT NULL, los `update` heredan `tenantId` del row. Validar que escrituras posteriores (lead update) usen el `lead.tenantId` del row leído. |
| `src/app/api/webhooks/resend/route.ts:67`                                           | KaledEmailLog            | read  | REVIEW | Lookup por `resendId` (proveedor → único). No es leak per se pero conviene validar `emailLog.tenantId` antes de actualizar el lead asociado. |
| `src/app/api/public/aplicar/route.ts:88–127`                                        | KaledLead                | read/write | OK | Resuelve `tenantId` via `resolveKaledTenantId()` y lo pasa explícito en `findUnique`/`create`/`update`. Tras NOT NULL, eliminar la rama `tenantId: null` del fallback (línea 93) y forzar error si `resolveKaledTenantId` falla. |
| `src/modules/masterclass/services/kaled-lead.service.ts:18–96, 108–371`             | KaledLead, KaledEmailLog | read/write | REVIEW | `captureLead` acepta `tenantId?` opcional y graba `tenantId: tenantId || null`. **Tras NOT NULL hay que forzar parámetro requerido** o la captura pública fallará. Resto del servicio (`getAllLeads`, `searchLeads`, `getLeadById`-trazas) ya pasa `tenantId` explícito. |
| `src/app/api/admin/kaled-leads/[id]/trigger-sequence/route.ts:29–48`                | KaledLead                | read  | REVIEW | Lee lead por `id` sin chequear `tenantId` del usuario contra el del lead. Falla de aislamiento horizontal. Agregar assertion. |
| `src/modules/kaled-crm/services/kaled-automation.service.ts:48–164,240,280,...`     | KaledEmailSequence, KaledLead, KaledEmailLog | read/write | REVIEW | Helpers leen lead por id y derivan tenant. Tras NOT NULL, validar que `triggerSequenceByStage` siempre reciba `tenantId` (hoy es opcional, línea 41). |
| `src/modules/kaled-crm/services/kaled-email.service.ts` (todo el archivo)            | KaledEmailTemplate, KaledEmailLog | read/write | OK | Todos los métodos públicos exigen `tenantId: string`. Sólo los helpers de envío (`sendAutomaticEmail`, etc.) lo aceptan opcional con fallback a `lead.tenantId`. Aceptable. |
| `src/modules/kaled-crm/services/kaled-campaign.service.ts`                          | KaledCampaign, KaledLead, KaledEmailTemplate, KaledEmailSequence, KaledEmailLog | read/write | OK | Todos los `create`/`findMany`/`update` reciben `tenantId` explícito. `getCampaignById` y `deleteCampaign` (líneas 62, 128, 205) no validan `tenantId` en el `where` → REVIEW menor (defensa-en-profundidad). |
| `src/modules/kaled-crm/services/kaled-analytics.service.ts`                         | KaledLead, KaledEmailLog, KaledCampaign | read | OK | Filtra por `tenantId` en todas las queries. |
| `src/app/api/admin/campaigns/analytics/stagnant/route.ts:13–25`                     | KaledLead                | read  | OK | Filtra por `tenantId` resuelto. |
| `src/app/api/admin/campaigns/analytics/performance/route.ts:13–25`                  | KaledCampaign            | read  | OK | Idem. |
| `src/app/api/cron/notifications/route.ts:60–122`                                    | PaymentCommitment        | read/write | OK | Itera tenants y filtra por `tenantId` en findMany/updateMany. |
| `src/modules/dashboard/services/dashboard.service.ts:22–124`                         | PaymentCommitment        | read  | OK | Resuelve `tenantId` y lo pasa explícito. |
| `src/modules/reports/services/reports.service.ts:31–470`                            | PaymentCommitment        | read  | OK | `assertTenantContext(tenantId)` + `where: { tenantId }`. |
| `src/modules/payments/services/payment.service.ts:41–660`                           | PaymentCommitment        | read/write | OK | Idem reports. |
| `src/modules/commitments/services/commitment.service.ts:7–100`                       | PaymentCommitment        | read/write | OK | Idem. |
| `src/modules/cartera/services/cartera.service.ts:16–305`                             | PaymentCommitment        | read/write | OK | Idem. |

### 3.2 MEDIO — Páginas admin (lectura via fetch a API)

Estas pages no acceden Prisma directamente; usan los endpoints API. Si los endpoints están OK, la página está OK por transitividad.

| Archivo                                                         | Estado |
|-----------------------------------------------------------------|--------|
| `src/app/admin/email-templates/page.tsx`                        | OK (depende de service) |
| `src/app/admin/email-templates/[id]/page.tsx`                   | OK |
| `src/app/admin/email-templates/library/page.tsx`                | OK |
| `src/app/admin/email-templates/analytics/page.tsx`              | OK |
| `src/app/admin/comercial/correos/page.tsx`                      | OK |
| `src/app/admin/campaigns/page.tsx`                              | OK |
| `src/app/admin/kaled-analytics/page.tsx`                        | OK |

### 3.3 BAJO — Seeds y scripts (no son riesgo runtime)

- `prisma/seeds/*` y `prisma/migrate-to-tenants.ts`: corren manualmente. Si tras migración 1.8 quedan referencias a inserts con `tenantId: undefined`, fallarán por NOT NULL — Dev debe pasar `tenantId` (kaledsoft id) en seeds CRM. **Mencionado, no bloqueante**.
- Tests: 0 cobertura sobre estos modelos. No bloquean.

### 3.4 Resumen de auditoría

- **OK**: 19 ubicaciones (services payments/cartera/commitments/reports/dashboard, analytics services, cron notifications, public/aplicar happy path, todas las pages).
- **FIX (P0)**: 2 endpoints — `kaled-emails/route.ts`, `funnel-analysis/route.ts`. Mas 1 cleanup en `public/aplicar/route.ts:93` (rama `tenantId: null`).
- **REVIEW**: 4 archivos — `process-kaled-emails`, `webhooks/resend`, `trigger-sequence`, `kaled-automation.service.ts`, `masterclass/kaled-lead.service.ts` (parámetro opcional → requerido), `kaled-campaign.service.ts` (defensa en findUnique).

**Total archivos a tocar por Dev: 7** (incluye `schema.prisma` + migración + 2 FIX P0 + 4 REVIEW menores).

---

## 4. SQL de migración propuesto

Crear archivo `prisma/migrations/20260427_make_tenantid_required_kaled_and_paymentcommitment/migration.sql` siguiendo el patrón de la migración 1.7b.

```sql
-- Tarea 1.8 Ola 1: tenantId NOT NULL en modelos Kaled* + PaymentCommitment
-- Patron: backfill -> validar 0 NULLs -> SET NOT NULL
-- IDs verificados en produccion 2026-04-27:
--   tenant kaledsoft = 'cmm6rb5c10000vsl0hr6xam62'

-- ============================================
-- 1. Backfill PaymentCommitment via Student.tenantId
-- ============================================
UPDATE "PaymentCommitment" pc
SET "tenantId" = s."tenantId"
FROM "Student" s
WHERE s.id = pc."studentId" AND pc."tenantId" IS NULL;

-- ============================================
-- 2. Backfill modelos Kaled* al tenant kaledsoft
-- ============================================
UPDATE "KaledLead"
SET "tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
WHERE "tenantId" IS NULL;

UPDATE "KaledEmailTemplate"
SET "tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
WHERE "tenantId" IS NULL;

UPDATE "KaledEmailSequence"
SET "tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
WHERE "tenantId" IS NULL;

-- KaledEmailLog y KaledCampaign no requieren backfill (0 NULLs verificados)
-- Pero blindamos por si entran rows entre la verificacion y la migracion:
UPDATE "KaledEmailLog"
SET "tenantId" = COALESCE(
  (SELECT "tenantId" FROM "KaledLead" WHERE id = "KaledEmailLog"."kaledLeadId"),
  'cmm6rb5c10000vsl0hr6xam62'
)
WHERE "tenantId" IS NULL;

UPDATE "KaledCampaign"
SET "tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
WHERE "tenantId" IS NULL;

-- ============================================
-- 3. Validar 0 NULLs antes de NOT NULL
-- ============================================
DO $$
DECLARE
  n_pc INTEGER;
  n_kl INTEGER;
  n_kel INTEGER;
  n_kc INTEGER;
  n_ket INTEGER;
  n_kes INTEGER;
BEGIN
  SELECT COUNT(*) INTO n_pc  FROM "PaymentCommitment"   WHERE "tenantId" IS NULL;
  SELECT COUNT(*) INTO n_kl  FROM "KaledLead"           WHERE "tenantId" IS NULL;
  SELECT COUNT(*) INTO n_kel FROM "KaledEmailLog"       WHERE "tenantId" IS NULL;
  SELECT COUNT(*) INTO n_kc  FROM "KaledCampaign"       WHERE "tenantId" IS NULL;
  SELECT COUNT(*) INTO n_ket FROM "KaledEmailTemplate"  WHERE "tenantId" IS NULL;
  SELECT COUNT(*) INTO n_kes FROM "KaledEmailSequence"  WHERE "tenantId" IS NULL;
  IF n_pc  > 0 THEN RAISE EXCEPTION 'PaymentCommitment   tiene % rows con tenantId NULL', n_pc;  END IF;
  IF n_kl  > 0 THEN RAISE EXCEPTION 'KaledLead           tiene % rows con tenantId NULL', n_kl;  END IF;
  IF n_kel > 0 THEN RAISE EXCEPTION 'KaledEmailLog       tiene % rows con tenantId NULL', n_kel; END IF;
  IF n_kc  > 0 THEN RAISE EXCEPTION 'KaledCampaign       tiene % rows con tenantId NULL', n_kc;  END IF;
  IF n_ket > 0 THEN RAISE EXCEPTION 'KaledEmailTemplate  tiene % rows con tenantId NULL', n_ket; END IF;
  IF n_kes > 0 THEN RAISE EXCEPTION 'KaledEmailSequence  tiene % rows con tenantId NULL', n_kes; END IF;
END $$;

-- ============================================
-- 4. SET NOT NULL
-- ============================================
ALTER TABLE "PaymentCommitment"  ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledLead"          ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledEmailLog"      ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledCampaign"      ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledEmailTemplate" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledEmailSequence" ALTER COLUMN "tenantId" SET NOT NULL;

-- Nota: las FK y los indices @@index([tenantId]) ya existen.
-- AgentTask permanece nullable (intencional, NO se toca en esta migracion).
```

### 4.1 Cambios en `prisma/schema.prisma` (Dev los hace, NO yo)

En cada uno de los 6 modelos, cambiar:

```prisma
tenantId  String?
tenant    Tenant?  @relation(fields: [tenantId], references: [id])
```

por:

```prisma
tenantId  String
tenant    Tenant   @relation(fields: [tenantId], references: [id])
```

Tras el cambio: `npx prisma generate` y verificar que el `@@unique([email, tenantId])` de `KaledLead` siga compilando (sí, porque `tenantId` deja de ser nullable y los uniques con NULL se vuelven más estrictos — verificar que no haya emails duplicados en el mismo tenant; ya verificado: 0 duplicados porque en producción solo hay 27 leads en kaledsoft con email único).

---

## 5. Riesgos / preguntas abiertas para Luis/PO

1. **¿Confirmamos que `kaledsoft` es el dueño correcto de las plantillas/secuencias seed?** Hoy sí, pero si más adelante `kaledacademy` quiere su propio CRM, esas plantillas deberían moverse — tema futuro, no bloqueante para 1.8.
2. **¿Hard-codeo el tenant id `cmm6rb5c10000vsl0hr6xam62` en la migración SQL o lo resuelvo via subquery `(SELECT id FROM "Tenant" WHERE slug = 'kaledsoft')`?** Recomiendo subquery — más portable entre branches Neon (preview/dev/prod). Dev puede ajustar.
3. **El `@@unique([email, tenantId])` en KaledLead actualmente tolera múltiples NULLs**. Tras NOT NULL será estricto. Verificado en prod: 27 emails únicos en kaledsoft + 1 NULL → tras backfill quedan 28 únicos, sin colisión. Seguro.
4. **El parámetro `tenantId?` opcional en `KaledLeadService.captureLead`** se introdujo justamente para no bloquear capturas de Facebook Ads cuando falla `resolveKaledTenantId()`. Tras NOT NULL, hay que decidir: ¿degradamos a "captura el lead aunque sin tenant" usando un tenant fallback (kaledsoft)? ¿o devolvemos error 500 al landing? **Recomendación**: fallback duro a kaledsoft (es el único cliente CRM real hoy). Confirmar con Luis.
5. **`AgentTask` queda nullable intencionalmente.** Documentar en commit message para no confundir auditorías futuras.
6. **Seeds**: Dev debe revisar `prisma/seeds/` para que los inserts de templates/sequences pasen `tenantId` explícito post-migración.

---

## 6. Estimación

| Etapa                                                                 | Horas |
|------------------------------------------------------------------------|-------|
| Schema.prisma — 6 modelos (`String?` → `String`, relación a `Tenant`) |  0.5  |
| `prisma migrate dev --name ...` y validación local                    |  0.5  |
| FIX P0 #1 — `kaled-emails/route.ts` + tests manuales                  |  1.0  |
| FIX P0 #2 — `funnel-analysis/route.ts` + tests                        |  0.5  |
| Cleanup — rama `tenantId: null` en `public/aplicar/route.ts`           |  0.5  |
| REVIEW — fortalecer `kaled-lead.service.ts` (param requerido) + ajustes en `kaled-automation.service.ts` |  1.5  |
| REVIEW — `trigger-sequence/route.ts` + `kaled-campaign.service.ts` (defensa)  |  1.0  |
| Seeds: pasar `tenantId` explícito                                      |  0.5  |
| Smoke E2E (capturar lead, enviar email, ver template, ver dashboard cartera) |  1.0  |
| `npm run build` + lint + commit + PR                                   |  0.5  |
| **Total Dev**                                                          | **7.5 h** |

Margen sugerido: **8 h** (1 jornada).

---

## 7. Checklist sugerido para Dev al ejecutar

- [ ] Crear branch `fix/multitenant-tenantid-kaled-required`
- [ ] Aplicar migración SQL en una branch Neon de preview primero (no en prod default)
- [ ] Modificar `prisma/schema.prisma` (6 modelos)
- [ ] `npx prisma generate`
- [ ] Aplicar FIX P0 (#1, #2) — agregar `tenantId` filter
- [ ] Aplicar REVIEW (forzar tenantId requerido en captureLead, asserts en trigger-sequence)
- [ ] Ajustar seeds para pasar `tenantId` explícito
- [ ] `npm run build` (debe pasar sin errores TS)
- [ ] Smoke test contra Neon preview
- [ ] Aplicar migración a producción (Neon main branch)
- [ ] Commit + PR a `develop`

---

*Generado por sub-agente PO en pre-auditoría 1.8 — todo verificado contra Neon prod 2026-04-27.*
