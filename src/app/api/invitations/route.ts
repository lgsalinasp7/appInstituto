/**
 * API Route: /api/invitations
 * Handles invitation creation and listing
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";
import { sendInvitationEmail } from "@/lib/email";
import { z } from "zod";

// Validation schema for creating invitation
const createInvitationSchema = z.object({
  email: z.string().email("Email inválido"),
  roleId: z.string().min(1, "Rol requerido"),
  inviterId: z.string().min(1, "Invitador requerido"),
});

/**
 * GET /api/invitations
 * List all invitations, optionally filtered by inviterId
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inviterId = searchParams.get("inviterId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (inviterId) {
      where.inviterId = inviterId;
    }

    if (status) {
      where.status = status;
    }

    const invitations = await prisma.invitation.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Error listing invitations:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener invitaciones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations
 * Create a new invitation and send email
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, roleId, inviterId } = validation.data;

    // Check if inviter exists and get their info
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
      include: { role: true },
    });

    if (!inviter) {
      return NextResponse.json(
        { success: false, error: "Usuario invitador no encontrado" },
        { status: 404 }
      );
    }

    // Check if inviter has permission (SUPERADMIN or ADMINISTRADOR)
    const allowedRoles = ["SUPERADMIN", "ADMINISTRADOR"];
    if (!allowedRoles.includes(inviter.role.name)) {
      return NextResponse.json(
        { success: false, error: "No tienes permisos para enviar invitaciones" },
        { status: 403 }
      );
    }

    // Check invitation limit for ADMINISTRADOR
    if (inviter.role.name === "ADMINISTRADOR") {
      // Count total occupied seats (Pending invitations + Accepted/Joined users) for THIS admin
      const totalOccupiedSeats = await prisma.invitation.count({
        where: {
          inviterId,
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      });

      if (totalOccupiedSeats >= inviter.invitationLimit) {
        return NextResponse.json(
          {
            success: false,
            code: "LIMIT_REACHED",
            error: "Has superado el tope de usuarios permitidos. Debe comunicarse con KaledSoft para aumentar la cantidad de usuarios.",
          },
          { status: 403 }
        );
      }
    }
    // Check if email already has a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: "Ya existe una invitación pendiente para este email" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Este email ya está registrado en el sistema" },
        { status: 400 }
      );
    }

    // Get role info
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    // Generate unique token
    const token = randomUUID();

    // Create invitation (expires in 7 days)
    const invitation = await prisma.invitation.create({
      data: {
        email,
        roleId,
        inviterId,
        token,
        expiresAt: addDays(new Date(), 7),
        status: "PENDING",
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
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

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: email,
        token,
        roleName: role.name,
        inviterName: inviter.name || inviter.email,
      });
    } catch (emailError) {
      // If email fails, delete the invitation
      await prisma.invitation.delete({
        where: { id: invitation.id },
      });

      console.error("Error sending invitation email:", emailError);
      return NextResponse.json(
        { success: false, error: "Error al enviar el email de invitación" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invitation,
      message: "Invitación enviada exitosamente",
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear invitación" },
      { status: 500 }
    );
  }
}
