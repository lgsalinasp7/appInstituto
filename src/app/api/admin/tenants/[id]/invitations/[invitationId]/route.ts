/**
 * API Route: DELETE /api/admin/tenants/[id]/invitations/[invitationId]
 * SUPER_ADMIN: elimina cualquier invitación. PENDING incluye limpieza de usuario huérfano cuando aplica.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";
import { deleteInvitationBySuperAdmin } from "@/lib/invitation-helpers";

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

      await deleteInvitationBySuperAdmin({
        id: invitation.id,
        email: invitation.email,
        tenantId: invitation.tenantId,
        status: invitation.status,
      });

      return NextResponse.json({
        success: true,
        message:
          invitation.status === "PENDING"
            ? "Invitación eliminada. Puedes enviar una nueva invitación."
            : "Registro de invitación eliminado. Si el usuario ya tenía cuenta, sigue existiendo en la pestaña Usuarios hasta que lo elimines ahí.",
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
