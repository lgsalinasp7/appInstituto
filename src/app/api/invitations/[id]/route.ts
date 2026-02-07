/**
 * API Route: /api/invitations/[id]
 * Handles individual invitation operations
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

interface RouteParams {
  params: Promise<Record<string, string>>;
}

/**
 * GET /api/invitations/[id]
 * Get a specific invitation by ID
 */
export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;

  const invitation = await prisma.invitation.findUnique({
    where: { 
      id,
      tenantId, // Verificar que pertenece al tenant
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json(
      { success: false, error: "Invitación no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: invitation,
  });
});

/**
 * DELETE /api/invitations/[id]
 * Cancel/delete an invitation
 */
export const DELETE = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;

  // Check if invitation exists
  const invitation = await prisma.invitation.findUnique({
    where: { 
      id,
      tenantId, // Verificar que pertenece al tenant
    },
  });

  if (!invitation) {
    return NextResponse.json(
      { success: false, error: "Invitación no encontrada" },
      { status: 404 }
    );
  }

  // Only allow deleting PENDING invitations
  if (invitation.status !== "PENDING") {
    return NextResponse.json(
      { success: false, error: "Solo se pueden cancelar invitaciones pendientes" },
      { status: 400 }
    );
  }

  // Delete the invitation
  await prisma.invitation.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: "Invitación cancelada exitosamente",
  });
});
