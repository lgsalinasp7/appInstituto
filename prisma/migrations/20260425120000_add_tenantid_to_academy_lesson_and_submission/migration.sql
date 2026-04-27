-- Tarea 1.7b Ola 1: Defense-in-depth multi-tenant
-- Agregar tenantId directo a AcademyLesson y AcademyDeliverableSubmission
-- Patron: nullable -> backfill -> NOT NULL + FK + index

-- 1. Agregar columna nullable
ALTER TABLE "AcademyLesson" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "AcademyDeliverableSubmission" ADD COLUMN "tenantId" TEXT;

-- 2. Backfill AcademyLesson via module -> course -> tenantId
UPDATE "AcademyLesson" l
SET "tenantId" = c."tenantId"
FROM "AcademyModule" m
INNER JOIN "AcademyCourse" c ON c.id = m."courseId"
WHERE m.id = l."moduleId";

-- 3. Backfill AcademyDeliverableSubmission via user -> tenantId
UPDATE "AcademyDeliverableSubmission" s
SET "tenantId" = u."tenantId"
FROM "User" u
WHERE u.id = s."userId" AND u."tenantId" IS NOT NULL;

-- 4. Verificar 0 NULLs antes de NOT NULL (si hay rows huerfanas, FALLA aqui)
DO $$
DECLARE
  null_lessons INTEGER;
  null_subs INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_lessons FROM "AcademyLesson" WHERE "tenantId" IS NULL;
  SELECT COUNT(*) INTO null_subs FROM "AcademyDeliverableSubmission" WHERE "tenantId" IS NULL;
  IF null_lessons > 0 THEN
    RAISE EXCEPTION 'AcademyLesson tiene % rows con tenantId NULL -- backfill incompleto', null_lessons;
  END IF;
  IF null_subs > 0 THEN
    RAISE EXCEPTION 'AcademyDeliverableSubmission tiene % rows con tenantId NULL -- backfill incompleto', null_subs;
  END IF;
END $$;

-- 5. Aplicar NOT NULL + FK + index
ALTER TABLE "AcademyLesson" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "AcademyDeliverableSubmission" ALTER COLUMN "tenantId" SET NOT NULL;

ALTER TABLE "AcademyLesson"
  ADD CONSTRAINT "AcademyLesson_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademyDeliverableSubmission"
  ADD CONSTRAINT "AcademyDeliverableSubmission_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "AcademyLesson_tenantId_idx" ON "AcademyLesson"("tenantId");
CREATE INDEX "AcademyDeliverableSubmission_tenantId_idx" ON "AcademyDeliverableSubmission"("tenantId");
