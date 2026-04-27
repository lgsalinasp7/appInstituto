-- Tarea 1.8 Ola 1: tenantId NOT NULL en modelos Kaled* + PaymentCommitment
-- Patron: backfill -> validar 0 NULLs -> SET NOT NULL
-- IDs verificados en produccion 2026-04-27:
--   tenant kaledsoft = 'cmm6rb5c10000vsl0hr6xam62'
-- AgentTask permanece nullable (intencional, NO se toca aqui).

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

-- KaledEmailTemplate: pre-resolver colisiones de unique (name, tenantId).
-- Si una plantilla seed (tenantId NULL) tiene el mismo "name" que una plantilla
-- ya tenanteada en kaledsoft, renombrar la seed con sufijo " (seed)" para conservar ambas.
UPDATE "KaledEmailTemplate" t
SET "name" = t."name" || ' (seed)'
WHERE t."tenantId" IS NULL
  AND EXISTS (
    SELECT 1 FROM "KaledEmailTemplate" o
    WHERE o."tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
      AND o."name" = t."name"
  );

UPDATE "KaledEmailTemplate"
SET "tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
WHERE "tenantId" IS NULL;

-- KaledEmailSequence: misma estrategia anti-colision.
UPDATE "KaledEmailSequence" s
SET "name" = s."name" || ' (seed)'
WHERE s."tenantId" IS NULL
  AND EXISTS (
    SELECT 1 FROM "KaledEmailSequence" o
    WHERE o."tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
      AND o."name" = s."name"
  );

UPDATE "KaledEmailSequence"
SET "tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
WHERE "tenantId" IS NULL;

-- KaledEmailLog: 0 NULLs en prod, blindamos heredando del lead asociado o cayendo a kaledsoft.
UPDATE "KaledEmailLog"
SET "tenantId" = COALESCE(
  (SELECT "tenantId" FROM "KaledLead" WHERE id = "KaledEmailLog"."kaledLeadId"),
  'cmm6rb5c10000vsl0hr6xam62'
)
WHERE "tenantId" IS NULL;

-- KaledCampaign: 0 NULLs en prod, blindamos
UPDATE "KaledCampaign"
SET "tenantId" = 'cmm6rb5c10000vsl0hr6xam62'
WHERE "tenantId" IS NULL;

-- ============================================
-- 3. Validar 0 NULLs antes de NOT NULL
-- ============================================
DO $$
DECLARE
  n_pc  INTEGER;
  n_kl  INTEGER;
  n_kel INTEGER;
  n_kc  INTEGER;
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
-- 4. SET NOT NULL (FKs e indexes ya existen previamente)
-- ============================================
ALTER TABLE "PaymentCommitment"  ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledLead"          ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledEmailLog"      ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledCampaign"      ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledEmailTemplate" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KaledEmailSequence" ALTER COLUMN "tenantId" SET NOT NULL;
