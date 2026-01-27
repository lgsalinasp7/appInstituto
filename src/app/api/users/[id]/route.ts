/**
 * API Route: /api/users/[id]
 * Handle individual user operations (GET, PUT, DELETE)
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for updating user
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  invitationLimit: z.number().int().min(0).optional(),
});

/**
 * GET /api/users/[id]
 * Get a specific user by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isActive: true,
        invitationLimit: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a user
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateUserSchema.safeParse(body);
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Prevent modifying SUPERADMIN users (except by themselves)
    if (existingUser.role.name === "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: "No se puede modificar usuarios SUPERADMIN" },
        { status: 403 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (validation.data.email && validation.data.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validation.data.email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: "Este email ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validation.data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isActive: true,
        invitationLimit: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado correctamente",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user (soft delete - set isActive to false)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Prevent deleting SUPERADMIN users
    if (user.role.name === "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: "No se puede eliminar usuarios SUPERADMIN" },
        { status: 403 }
      );
    }

    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
