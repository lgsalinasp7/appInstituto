/**
 * Helpers para invitaciones.
 * Incluye lógica para eliminar usuarios huérfanos creados por intentos fallidos de aceptación.
 *
 * Trade-off (no hay forma de cumplir ambas a la vez):
 * - **Atómico** (este módulo para cancelar invitación): invitación + huérfano en una transacción.
 *   Si el User no se puede borrar (FK Restrict), **no** se elimina la invitación.
 * - **Siempre borrar invitación**: habría que hacer dos pasos y aceptar huérfanos en BD, o
 *   limpiar antes las relaciones que bloquean el delete del User.
 */

import prisma from "@/lib/prisma";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const ORPHAN_USER_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 horas

/** User candidato a huérfano de invitación fallida, o null si no aplica. */
async function findOrphanUserIdForInvitationCleanup(
  db: Pick<typeof prisma, "user">,
  email: string,
  tenantId: string
): Promise<string | null> {
  const user = await db.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      tenantId,
    },
    include: {
      academyEnrollments: { take: 1 },
    },
  });
  if (!user) return null;
  if (user.academyEnrollments.length > 0) return null;
  if (Date.now() - user.createdAt.getTime() > ORPHAN_USER_WINDOW_MS) return null;
  return user.id;
}

/**
 * Best-effort fuera de transacción (p. ej. scripts, tareas de limpieza).
 * Si el delete falla por FK, no lanza.
 */
export async function deleteOrphanUserIfExists(
  email: string,
  tenantId: string
): Promise<{ deleted: boolean; userId?: string }> {
  const userId = await findOrphanUserIdForInvitationCleanup(prisma, email, tenantId);
  if (!userId) return { deleted: false };
  try {
    await prisma.user.delete({ where: { id: userId } });
    return { deleted: true, userId };
  } catch (err) {
    console.warn(
      "[deleteOrphanUserIfExists] No se pudo eliminar usuario huérfano (p. ej. FK Restrict):",
      userId,
      err
    );
    return { deleted: false };
  }
}

/**
 * Elimina invitación y, si existe usuario huérfano elegible, ese User — **en una sola transacción**.
 * Si el borrado del User falla (p. ej. sentInvitations / otras FK Restrict), hace rollback:
 * la invitación **no** se elimina y el caller debe devolver error al cliente.
 */
export async function deleteInvitationWithOrphanCleanup(invitation: {
  id: string;
  email: string;
  tenantId: string;
}): Promise<void> {
  await prisma.$transaction(async (tx: TxClient) => {
    await tx.invitation.delete({
      where: { id: invitation.id },
    });

    const orphanUserId = await findOrphanUserIdForInvitationCleanup(
      tx,
      invitation.email,
      invitation.tenantId
    );
    if (orphanUserId) {
      await tx.user.delete({ where: { id: orphanUserId } });
    }
  });
}

/**
 * SUPER_ADMIN: elimina cualquier invitación del tenant.
 * - PENDIENTE: misma lógica que deleteInvitationWithOrphanCleanup (huérfanos).
 * - Aceptada / expirada: solo borra el registro de invitación (la cuenta de usuario, si existe, se gestiona apartado Usuarios).
 */
export async function deleteInvitationBySuperAdmin(invitation: {
  id: string;
  email: string;
  tenantId: string;
  status: string;
}): Promise<void> {
  if (invitation.status === "PENDING") {
    await deleteInvitationWithOrphanCleanup(invitation);
    return;
  }
  await prisma.invitation.delete({
    where: { id: invitation.id },
  });
}
