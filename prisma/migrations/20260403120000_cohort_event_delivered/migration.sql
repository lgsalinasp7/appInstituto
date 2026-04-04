-- AlterTable
ALTER TABLE "AcademyCohortEvent" ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "deliveredByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "AcademyCohortEvent" ADD CONSTRAINT "AcademyCohortEvent_deliveredByUserId_fkey" FOREIGN KEY ("deliveredByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "AcademyCohortEvent_deliveredByUserId_idx" ON "AcademyCohortEvent"("deliveredByUserId");
