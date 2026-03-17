/**
 * Helpers para invitaciones.
 * Incluye lógica para eliminar usuarios huérfanos creados por intentos fallidos de aceptación.
 */

import prisma from "@/lib/prisma";

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
  tenantId: string
): Promise<{ deleted: boolean; userId?: string }> {
  const user = await prisma.user.findFirst({
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

  await prisma.user.delete({
    where: { id: user.id },
  });

  return { deleted: true, userId: user.id };
}
