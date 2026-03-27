-- AlterTable AcademyCohort
ALTER TABLE "AcademyCohort" ADD COLUMN IF NOT EXISTS "lessonGatingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AcademyCohort" ADD COLUMN IF NOT EXISTS "timezone" TEXT;

-- AlterTable AcademyLessonMeta
ALTER TABLE "AcademyLessonMeta" ADD COLUMN IF NOT EXISTS "isPrecohort" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable AcademyCohortEvent
ALTER TABLE "AcademyCohortEvent" ADD COLUMN IF NOT EXISTS "lessonId" TEXT;
ALTER TABLE "AcademyCohortEvent" ADD COLUMN IF NOT EXISTS "sessionOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AcademyCohortEvent" ADD COLUMN IF NOT EXISTS "cancelled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable AcademyCohortLessonRelease
CREATE TABLE IF NOT EXISTS "AcademyCohortLessonRelease" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedByUserId" TEXT,

    CONSTRAINT "AcademyCohortLessonRelease_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AcademyCohortLessonRelease_cohortId_lessonId_key" ON "AcademyCohortLessonRelease"("cohortId", "lessonId");
CREATE INDEX IF NOT EXISTS "AcademyCohortLessonRelease_cohortId_idx" ON "AcademyCohortLessonRelease"("cohortId");
CREATE INDEX IF NOT EXISTS "AcademyCohortLessonRelease_lessonId_idx" ON "AcademyCohortLessonRelease"("lessonId");

ALTER TABLE "AcademyCohortLessonRelease" ADD CONSTRAINT "AcademyCohortLessonRelease_cohortId_fkey"
  FOREIGN KEY ("cohortId") REFERENCES "AcademyCohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademyCohortLessonRelease" ADD CONSTRAINT "AcademyCohortLessonRelease_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "AcademyLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademyCohortLessonRelease" ADD CONSTRAINT "AcademyCohortLessonRelease_releasedByUserId_fkey"
  FOREIGN KEY ("releasedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "AcademyCohortEvent_lessonId_idx" ON "AcademyCohortEvent"("lessonId");

ALTER TABLE "AcademyCohortEvent" ADD CONSTRAINT "AcademyCohortEvent_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "AcademyLesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
