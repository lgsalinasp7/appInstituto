/**
 * API Route: /api/invitations/[id]
 * Handles individual invitation operations
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/invitations/[id]
 * Get a specific invitation by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
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
  } catch (error) {
    console.error("Error getting invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener invitación" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invitations/[id]
 * Cancel/delete an invitation
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if invitation exists
    const invitation = await prisma.invitation.findUnique({
      where: { id },
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
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al cancelar invitación" },
      { status: 500 }
    );
  }
}
