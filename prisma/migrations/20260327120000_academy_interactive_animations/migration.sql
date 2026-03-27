-- CreateTable
CREATE TABLE "AcademyInteractiveAnimation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceDocHint" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyInteractiveAnimation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademyInteractiveAnimation_tenantId_slug_key" ON "AcademyInteractiveAnimation"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "AcademyInteractiveAnimation_tenantId_idx" ON "AcademyInteractiveAnimation"("tenantId");

-- AddForeignKey
ALTER TABLE "AcademyInteractiveAnimation" ADD CONSTRAINT "AcademyInteractiveAnimation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "AcademyLessonMeta" ADD COLUMN "interactiveAnimationId" TEXT;

-- CreateIndex
CREATE INDEX "AcademyLessonMeta_interactiveAnimationId_idx" ON "AcademyLessonMeta"("interactiveAnimationId");

-- AddForeignKey
ALTER TABLE "AcademyLessonMeta" ADD CONSTRAINT "AcademyLessonMeta_interactiveAnimationId_fkey" FOREIGN KEY ("interactiveAnimationId") REFERENCES "AcademyInteractiveAnimation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
