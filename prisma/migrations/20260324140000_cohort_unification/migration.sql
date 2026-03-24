-- AlterTable Tenant: default timezone for cohort / promo logic
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'America/Bogota';

-- CreateEnum
CREATE TYPE "AcademyCohortKind" AS ENUM ('ACADEMIC', 'PROMOTIONAL');
CREATE TYPE "AcademyCohortPromoPreset" AS ENUM ('DAYS_3', 'DAYS_7', 'CUSTOM');
CREATE TYPE "AcademyCohortAdminAuditAction" AS ENUM (
  'CREATE_COHORT',
  'UPDATE_COHORT',
  'DELETE_COHORT',
  'MOVE_STUDENT',
  'MERGE_COHORTS',
  'ASSIGN_TEACHER',
  'UNASSIGN_TEACHER'
);

-- AlterTable AcademyCohort
ALTER TABLE "AcademyCohort" ADD COLUMN "kind" "AcademyCohortKind" NOT NULL DEFAULT 'ACADEMIC';
ALTER TABLE "AcademyCohort" ADD COLUMN "promoPreset" "AcademyCohortPromoPreset";
ALTER TABLE "AcademyCohort" ADD COLUMN "campaignLabel" TEXT;

CREATE INDEX "AcademyCohort_kind_idx" ON "AcademyCohort"("kind");

-- Heuristic backfill: short windows or masterclass naming → promotional
UPDATE "AcademyCohort"
SET
  "kind" = 'PROMOTIONAL',
  "promoPreset" = CASE
    WHEN ("endDate" - "startDate") <= INTERVAL '4 days' THEN 'DAYS_3'::"AcademyCohortPromoPreset"
    WHEN ("endDate" - "startDate") <= INTERVAL '10 days' THEN 'DAYS_7'::"AcademyCohortPromoPreset"
    ELSE 'CUSTOM'::"AcademyCohortPromoPreset"
  END
WHERE
  LOWER("name") LIKE '%masterclass%'
  OR ("endDate" - "startDate") <= INTERVAL '10 days';

-- Enrollment: prevent deleting cohort while students are linked
ALTER TABLE "AcademyEnrollment" DROP CONSTRAINT "AcademyEnrollment_cohortId_fkey";
ALTER TABLE "AcademyEnrollment" ADD CONSTRAINT "AcademyEnrollment_cohortId_fkey"
  FOREIGN KEY ("cohortId") REFERENCES "AcademyCohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AcademyCohortTeacherAssignment
CREATE TABLE "AcademyCohortTeacherAssignment" (
  "id" TEXT NOT NULL,
  "cohortId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AcademyCohortTeacherAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AcademyCohortTeacherAssignment_cohortId_teacherId_key"
  ON "AcademyCohortTeacherAssignment"("cohortId", "teacherId");
CREATE INDEX "AcademyCohortTeacherAssignment_teacherId_idx"
  ON "AcademyCohortTeacherAssignment"("teacherId");
ALTER TABLE "AcademyCohortTeacherAssignment" ADD CONSTRAINT "AcademyCohortTeacherAssignment_cohortId_fkey"
  FOREIGN KEY ("cohortId") REFERENCES "AcademyCohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademyCohortTeacherAssignment" ADD CONSTRAINT "AcademyCohortTeacherAssignment_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AcademyCohortAdminAudit
CREATE TABLE "AcademyCohortAdminAudit" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" "AcademyCohortAdminAuditAction" NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AcademyCohortAdminAudit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AcademyCohortAdminAudit_tenantId_idx" ON "AcademyCohortAdminAudit"("tenantId");
CREATE INDEX "AcademyCohortAdminAudit_actorUserId_idx" ON "AcademyCohortAdminAudit"("actorUserId");
CREATE INDEX "AcademyCohortAdminAudit_createdAt_idx" ON "AcademyCohortAdminAudit"("createdAt");
CREATE INDEX "AcademyCohortAdminAudit_action_idx" ON "AcademyCohortAdminAudit"("action");
ALTER TABLE "AcademyCohortAdminAudit" ADD CONSTRAINT "AcademyCohortAdminAudit_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademyCohortAdminAudit" ADD CONSTRAINT "AcademyCohortAdminAudit_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AcademyInAppNotification
CREATE TABLE "AcademyInAppNotification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AcademyInAppNotification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AcademyInAppNotification_userId_readAt_idx" ON "AcademyInAppNotification"("userId", "readAt");
CREATE INDEX "AcademyInAppNotification_tenantId_idx" ON "AcademyInAppNotification"("tenantId");
CREATE INDEX "AcademyInAppNotification_createdAt_idx" ON "AcademyInAppNotification"("createdAt");
ALTER TABLE "AcademyInAppNotification" ADD CONSTRAINT "AcademyInAppNotification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademyInAppNotification" ADD CONSTRAINT "AcademyInAppNotification_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
