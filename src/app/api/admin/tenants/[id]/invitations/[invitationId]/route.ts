/**
 * API Route: DELETE /api/admin/tenants/[id]/invitations/[invitationId]
 * Permite a SUPER_ADMIN eliminar una invitación (solo PENDING) para poder reenviar.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";
import { deleteOrphanUserIfExists } from "@/lib/invitation-helpers";

interface RouteContext {
  params: Promise<{ id: string; invitationId: string }>;
}

export const DELETE = withPlatformAdmin(
  ["SUPER_ADMIN"],
  async (request: NextRequest, user, context) => {
    try {
      const params = context?.params ? await context.params : {};
      const { id: idOrSlug, invitationId } = params;
      if (!idOrSlug || !invitationId) {
        return NextResponse.json(
          { success: false, error: "Tenant e invitación requeridos" },
          { status: 400 }
        );
      }

      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: idOrSlug },
            { slug: { equals: idOrSlug, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      if (!tenant) {
        return NextResponse.json({ success: false, error: "Tenant no encontrado" }, { status: 404 });
      }

      const invitation = await prisma.invitation.findFirst({
        where: { id: invitationId, tenantId: tenant.id },
      });
      if (!invitation) {
        return NextResponse.json({ success: false, error: "Invitación no encontrada" }, { status: 404 });
      }

      if (invitation.status !== "PENDING") {
        return NextResponse.json(
          { success: false, error: "Solo se pueden eliminar invitaciones pendientes para reenviar" },
          { status: 400 }
        );
      }

      const email = invitation.email;
      const tenantId = invitation.tenantId;

      await prisma.invitation.delete({
        where: { id: invitationId },
      });

      // Si existe un User huérfano (creado por intento fallido de aceptación), eliminarlo
      await deleteOrphanUserIfExists(email, tenantId);

      return NextResponse.json({
        success: true,
        message: "Invitación eliminada. Puedes enviar una nueva invitación.",
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
