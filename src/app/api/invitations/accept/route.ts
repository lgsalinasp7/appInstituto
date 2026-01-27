/**
 * API Route: /api/invitations/accept
 * Accept an invitation and create user account
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/modules/auth/services/auth.service";
import { z } from "zod";

// Validation schema
const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});

/**
 * GET /api/invitations/accept?token=xxx
 * Validate token and get invitation details
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token requerido" },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
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

    // Check if already accepted
    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Esta invitación ya fue aceptada" },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
      // Update status if not already expired
      if (invitation.status !== "EXPIRED") {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: "EXPIRED" },
        });
      }

      return NextResponse.json(
        { success: false, error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        inviter: invitation.inviter,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al validar invitación" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations/accept
 * Accept invitation and create user account
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = acceptInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { token, name, password } = validation.data;

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        role: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Esta invitación ya fue aceptada" },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });

      return NextResponse.json(
        { success: false, error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Create user with hashed password using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await AuthService.createUser({
        email: invitation.email,
        name,
        password,
        roleId: invitation.roleId,
      });

      // Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      data: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role.name,
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
