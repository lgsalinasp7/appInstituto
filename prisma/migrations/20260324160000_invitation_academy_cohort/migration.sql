-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN "academyCohortId" TEXT;

-- CreateIndex
CREATE INDEX "Invitation_academyCohortId_idx" ON "Invitation"("academyCohortId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_academyCohortId_fkey" FOREIGN KEY ("academyCohortId") REFERENCES "AcademyCohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;
