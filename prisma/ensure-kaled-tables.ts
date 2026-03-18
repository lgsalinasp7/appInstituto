/**
 * Crea las tablas Kaled si no existen. Solo añade, nunca elimina.
 * Ejecutar en build: npx tsx prisma/ensure-kaled-tables.ts
 */
import { PrismaClient } from "@prisma/client";

const sql = `
-- kaled_student_error_patterns
CREATE TABLE IF NOT EXISTS kaled_student_error_patterns (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "errorPattern" TEXT NOT NULL,
  "errorLabel" TEXT NOT NULL,
  occurrences INTEGER NOT NULL DEFAULT 1,
  "firstSeenAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lessonIds" TEXT[] NOT NULL DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" TIMESTAMP
);
CREATE INDEX IF NOT EXISTS kaled_student_error_patterns_userId_tenantId_idx ON kaled_student_error_patterns ("userId", "tenantId");

-- kaled_instructor_tasks
CREATE TABLE IF NOT EXISTS kaled_instructor_tasks (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "instructorId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  title TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "reviewedAt" TIMESTAMP,
  "resolvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS kaled_instructor_tasks_instructorId_status_idx ON kaled_instructor_tasks ("instructorId", status);
CREATE INDEX IF NOT EXISTS kaled_instructor_tasks_tenantId_idx ON kaled_instructor_tasks ("tenantId");
CREATE INDEX IF NOT EXISTS kaled_instructor_tasks_studentId_idx ON kaled_instructor_tasks ("studentId");

-- kaled_cohort_metrics
CREATE TABLE IF NOT EXISTS kaled_cohort_metrics (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "cohortId" TEXT NOT NULL,
  "snapshotDate" DATE NOT NULL,
  "totalStudents" INTEGER NOT NULL DEFAULT 0,
  "studentsOnTrack" INTEGER NOT NULL DEFAULT 0,
  "studentsAtRisk" INTEGER NOT NULL DEFAULT 0,
  "saasDeployedCount" INTEGER NOT NULL DEFAULT 0,
  "avgProgress" DECIMAL(5,2),
  "totalKaledQueries" INTEGER NOT NULL DEFAULT 0,
  "cacheHitRate" DECIMAL(5,2),
  "tokensSaved" INTEGER NOT NULL DEFAULT 0,
  "deliverablesApproved" INTEGER NOT NULL DEFAULT 0,
  UNIQUE ("cohortId", "snapshotDate")
);
CREATE INDEX IF NOT EXISTS kaled_cohort_metrics_tenantId_idx ON kaled_cohort_metrics ("tenantId");
CREATE INDEX IF NOT EXISTS kaled_cohort_metrics_cohortId_idx ON kaled_cohort_metrics ("cohortId");
`;

async function main() {
  // Vercel Preview a veces no inyecta DATABASE_URL en el paso de build; las tablas
  // se aseguran en CI (deploy-dev / deploy-prod) tras migrate deploy.
  if (!process.env.DATABASE_URL?.trim()) {
    console.warn(
      "[ensure-kaled-tables] Omitido: DATABASE_URL no definida (build sin DB). " +
        "Las tablas Kaled deben existir por migraciones + paso CI ensure-kaled-tables."
    );
    return;
  }

  const prisma = new PrismaClient();
  try {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      const s = stmt.trim();
      if (!s) continue;
      await prisma.$executeRawUnsafe(s + (s.endsWith(";") ? "" : ";"));
    }
    console.log("[ensure-kaled-tables] Tablas verificadas/creadas");
  } catch (e) {
    console.error("[ensure-kaled-tables]", e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error("[ensure-kaled-tables]", e);
    process.exit(1);
  });
