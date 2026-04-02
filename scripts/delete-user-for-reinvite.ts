/**
 * Elimina un usuario por email y filas de Invitation asociadas al mismo correo,
 * resolviendo FKs sin onDelete: Cascade para poder volver a invitar.
 *
 * Uso (DEV con .env):
 *   npx tsx scripts/delete-user-for-reinvite.ts <email>
 *
 * PROD (variables ya exportadas; tienen prioridad sobre .env):
 *   $env:DATABASE_URL="..."; $env:DIRECT_URL="..."; npx tsx scripts/delete-user-for-reinvite.ts <email>
 */
import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";

const emailArg = process.argv[2];
if (!emailArg) {
  console.error("Uso: npx tsx scripts/delete-user-for-reinvite.ts <email>");
  process.exit(1);
}

const emailNorm = emailArg.trim().toLowerCase();

function maskUrl(u: string | undefined): string {
  if (!u) return "(no definida)";
  try {
    const parsed = new URL(u.replace(/^postgresql:/, "http:"));
    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
  } catch {
    return "(url inválida)";
  }
}

async function findUser(prisma: PrismaClient) {
  return prisma.user.findFirst({
    where: { email: { equals: emailNorm, mode: "insensitive" } },
    select: { id: true, email: true, tenantId: true },
  });
}

async function fallbackUserId(
  prisma: PrismaClient,
  tenantId: string | null,
  excludeId: string
): Promise<string> {
  if (tenantId) {
    const u = await prisma.user.findFirst({
      where: { tenantId, id: { not: excludeId } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (u) return u.id;
  }
  const admin = await prisma.user.findFirst({
    where: { id: { not: excludeId }, platformRole: "SUPER_ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (admin) return admin.id;
  const anyUser = await prisma.user.findFirst({
    where: { id: { not: excludeId } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!anyUser) {
    throw new Error(
      "No hay otro usuario en la BD para reasignar FKs (Student.advisor, Payment.registeredBy, etc.)."
    );
  }
  return anyUser.id;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL no está definida.");
    process.exit(1);
  }
  console.log("Conectando a:", maskUrl(databaseUrl));

  const prisma = new PrismaClient();

  try {
    const user = await findUser(prisma);

    const invDeleted = await prisma.invitation.deleteMany({
      where: { email: { equals: emailNorm, mode: "insensitive" } },
    });
    console.log(`Invitaciones eliminadas por email: ${invDeleted.count}`);

    const pwDeleted = await prisma.passwordReset.deleteMany({
      where: { email: { equals: emailNorm, mode: "insensitive" } },
    });
    console.log(`PasswordReset eliminados: ${pwDeleted.count}`);

    if (!user) {
      console.log(
        `No existe User con email "${emailNorm}". Limpieza de invitaciones/password reset hecha.`
      );
      return;
    }

    const { id: uid, tenantId } = user;
    console.log(`User encontrado: id=${uid} tenantId=${tenantId ?? "(null)"}`);

    const fallback = await fallbackUserId(prisma, tenantId, uid);

    await prisma.$transaction(
      async (tx) => {
        await tx.invitation.deleteMany({ where: { inviterId: uid } });

        await tx.student.updateMany({
          where: { advisorId: uid },
          data: { advisorId: fallback },
        });

        await tx.payment.updateMany({
          where: { registeredById: uid },
          data: { registeredById: fallback },
        });

        await tx.prospect.updateMany({
          where: { advisorId: uid },
          data: { advisorId: fallback },
        });

        await tx.prospectInteraction.updateMany({
          where: { advisorId: uid },
          data: { advisorId: null },
        });

        await tx.academyCourse.updateMany({
          where: { createdById: uid },
          data: { createdById: fallback },
        });

        await tx.academyDeliverableSubmission.updateMany({
          where: { reviewedById: uid },
          data: { reviewedById: null },
        });

        await tx.academyAnnouncement.updateMany({
          where: { authorId: uid },
          data: { authorId: fallback },
        });

        await tx.kaledLeadInteraction.updateMany({
          where: { userId: uid },
          data: { userId: null },
        });

        await tx.lavaderoOrder.updateMany({
          where: { createdBy: uid },
          data: { createdBy: fallback },
        });

        await tx.lavaderoPayment.updateMany({
          where: { createdBy: uid },
          data: { createdBy: fallback },
        });

        await tx.auditLog.updateMany({
          where: { userId: uid },
          data: { userId: null },
        });

        await tx.$executeRaw`
          DELETE FROM "kaled_code_reviews" WHERE "userId" = ${uid}
        `;
        await tx.$executeRaw`
          DELETE FROM "kaled_student_error_patterns" WHERE "userId" = ${uid}
        `;
        await tx.$executeRaw`
          DELETE FROM "kaled_instructor_tasks"
          WHERE "instructorId" = ${uid} OR "studentId" = ${uid}
        `;
        await tx.$executeRaw`
          DELETE FROM "kaled_deliverable_evaluations" WHERE "userId" = ${uid}
        `;

        await tx.user.delete({ where: { id: uid } });
      },
      { timeout: 120_000 }
    );

    console.log(`Usuario ${uid} eliminado. Puedes volver a invitar ${emailNorm}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
