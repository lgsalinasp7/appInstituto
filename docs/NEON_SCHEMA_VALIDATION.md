# Validación Schema Prisma vs Neon (neon-app-tecnico)

**Proyecto Neon:** `polished-recipe-25817067` (neon-app-tecnico)  
**Fecha:** 2026-03-17

## Estado general

Las tablas principales **existen** y tienen datos:
- **Tenant:** 5 registros (edutec, kaledsoft, poimensoft, lavadero-prueba, kaledacademy)
- **User:** 19 registros
- **Role:** datos presentes

## Tablas que FALTAN en Neon

| Modelo Prisma | Tabla en BD (@@map) | Estado |
|---------------|---------------------|--------|
| KaledCodeReview | kaled_code_reviews | ❌ NO EXISTE |
| KaledDeliverableEvaluation | kaled_deliverable_evaluations | ❌ NO EXISTE |

## Tablas que SÍ existen (74 tablas)

Todas las demás tablas del schema están presentes, incluyendo:
- Tenant, User, Role, Session, Invitation, etc.
- AcademyEnrollment, AcademyCohort, AcademyCourse, etc.
- kaled_cohort_metrics, kaled_instructor_tasks, kaled_student_error_patterns

## Enums

El enum `FinancePaymentStatus` **no existe** en la base de datos. La columna `AcademyEnrollment.paymentStatus` está como `text`. Prisma puede funcionar si los valores almacenados coinciden con el enum (PENDING, PARTIAL, PAID, etc.).

## Acciones recomendadas

### 1. Crear tablas faltantes

Ejecutar en Neon (o via `prisma db execute`):

```sql
-- kaled_code_reviews
CREATE TABLE IF NOT EXISTS kaled_code_reviews (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT,
  "cralPhase" TEXT NOT NULL,
  "codeSubmitted" TEXT NOT NULL,
  feedback TEXT NOT NULL,
  "errorPatterns" TEXT[] NOT NULL DEFAULT '{}',
  "weekNumber" INTEGER,
  "sessionNumber" INTEGER,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS kaled_code_reviews_userId_idx ON kaled_code_reviews ("userId");
CREATE INDEX IF NOT EXISTS kaled_code_reviews_tenantId_idx ON kaled_code_reviews ("tenantId");
CREATE INDEX IF NOT EXISTS kaled_code_reviews_status_idx ON kaled_code_reviews (status);

-- kaled_deliverable_evaluations
CREATE TABLE IF NOT EXISTS kaled_deliverable_evaluations (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cralPhase" TEXT NOT NULL,
  "codeReviewed" TEXT,
  "feedbackConstruir" TEXT,
  "feedbackRomper" TEXT,
  "feedbackAuditar" TEXT,
  "feedbackLanzar" TEXT,
  "overallFeedback" TEXT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  "socraticQuestions" TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP,
  "visibleToStudent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS kaled_deliverable_evaluations_submissionId_idx ON kaled_deliverable_evaluations ("submissionId");
CREATE INDEX IF NOT EXISTS kaled_deliverable_evaluations_tenantId_idx ON kaled_deliverable_evaluations ("tenantId");
CREATE INDEX IF NOT EXISTS kaled_deliverable_evaluations_status_idx ON kaled_deliverable_evaluations (status);
```

### 2. Si Vercel usa otra base de datos

Si ves errores P2021 ("tabla no existe") en producción, **Vercel puede estar apuntando a otra base de datos** (vacía o distinta). Ver [FIX_DATABASE_URL_VERCEL.md](./FIX_DATABASE_URL_VERCEL.md).

### 3. Sincronización futura

Para mantener schema y BD alineados:
- Usar `prisma migrate deploy` en CI/CD contra la URL de producción
- O `prisma db push` en entornos controlados (desarrollo/staging)
