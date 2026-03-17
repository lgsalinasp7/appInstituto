/**
 * Helpers para invitaciones.
 * Incluye lógica para eliminar usuarios huérfanos creados por intentos fallidos de aceptación.
 */

import prisma from "@/lib/prisma";

/** Cliente de transacción (compatible con prisma.$transaction) */
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Ventana de tiempo (ms) para considerar un User como huérfano de invitación fallida */
const ORPHAN_USER_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 horas

/**
 * Elimina un usuario huérfano si existe: User creado durante un intento fallido de
 * aceptar invitación (ej. error en AcademyEnrollment) pero que nunca completó el registro.
 * Solo elimina si:
 * - El User tiene el mismo email que la invitación
 * - Pertenece al mismo tenant
 * - No tiene AcademyEnrollment
 * - Fue creado recientemente (últimas 48h)
 */
export async function deleteOrphanUserIfExists(
  email: string,
  tenantId: string,
  tx?: TxClient
): Promise<{ deleted: boolean; userId?: string }> {
  const db = tx ?? prisma;

  const user = await db.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      tenantId,
    },
    include: {
      academyEnrollments: { take: 1 },
    },
  });

  if (!user) return { deleted: false };

  if (user.academyEnrollments.length > 0) {
    return { deleted: false };
  }

  const createdAt = user.createdAt.getTime();
  const now = Date.now();
  if (now - createdAt > ORPHAN_USER_WINDOW_MS) {
    return { deleted: false };
  }

  try {
    await db.user.delete({
      where: { id: user.id },
    });
    return { deleted: true, userId: user.id };
  } catch (err) {
    // El usuario puede tener relaciones Restrict (ej. sentInvitations, advisor en Prospect)
    // que impiden el delete. No fallar la transacción: la invitación ya se eliminó.
    console.warn("[deleteOrphanUserIfExists] No se pudo eliminar usuario huérfano:", user.id, err);
    return { deleted: false };
  }
}

/**
 * Elimina una invitación y, si existe, intenta eliminar el usuario huérfano asociado.
 * La eliminación de la invitación es atómica y prioritaria. La limpieza del usuario
 * huérfano es best-effort: si falla (ej. por restricciones FK como sentInvitations),
 * se registra el error pero la transacción se confirma igual (la invitación ya se eliminó).
 */
export async function deleteInvitationWithOrphanCleanup(invitation: {
  id: string;
  email: string;
  tenantId: string;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Eliminar invitación
    await tx.invitation.delete({
      where: { id: invitation.id },
    });

    // 2. Eliminar usuario huérfano si existe (dentro de la misma transacción)
    await deleteOrphanUserIfExists(invitation.email, invitation.tenantId, tx);
  });
}
