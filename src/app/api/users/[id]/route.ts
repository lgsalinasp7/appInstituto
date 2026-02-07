/**
 * API Route: /api/users/[id]
 * Handle individual user operations (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

interface RouteParams {
  params: Promise<Record<string, string>>;
}

// Validation schema for updating user
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
  isActive: z.boolean().optional(),
  invitationLimit: z.number().int().min(0).optional(),
});

/**
 * GET /api/users/[id]
 * Get a specific user by ID
 */
export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;

  const targetUser = await prisma.user.findUnique({
    where: {
      id,
      tenantId, // Verificar que pertenece al tenant
    },
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

  if (!targetUser) {
    return NextResponse.json(
      { success: false, error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: targetUser,
  });
});

/**
 * PUT /api/users/[id]
 * Update a user
 */
export const PUT = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const body = await request.json();

  // Validate input
  const validation = updateUserSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Datos inválidos",
        details: validation.error.issues,
      },
      { status: 400 }
    );
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
      tenantId, // Verificar que pertenece al tenant
    },
    include: { role: true },
  });

  if (!existingUser) {
    return NextResponse.json(
      { success: false, error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  // Prevent modifying SUPERADMIN users (except by themselves)
  if (existingUser.role?.name === "SUPERADMIN") {
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
});

/**
 * DELETE /api/users/[id]
 * Delete a user (soft delete - set isActive to false)
 */
export const DELETE = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;

  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: {
      id,
      tenantId, // Verificar que pertenece al tenant
    },
    include: { role: true },
  });

  if (!targetUser) {
    return NextResponse.json(
      { success: false, error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  // Prevent deleting SUPERADMIN users
  if (targetUser.role?.name === "SUPERADMIN") {
    return NextResponse.json(
      { success: false, error: "No se puede eliminar usuarios SUPERADMIN" },
      { status: 403 }
    );
  }

  // Permission check: Only SUPERADMIN or tenant ADMINISTRADOR
  const isSuperAdmin = user.role?.name === "SUPERADMIN";
  const isAdmin = user.role?.name === "ADMINISTRADOR";

  if (!isSuperAdmin && !isAdmin) {
    return NextResponse.json(
      { success: false, error: "No tiene permisos para eliminar usuarios" },
      { status: 403 }
    );
  }

  // Prevent users from deleting themselves
  if (user.id === id) {
    return NextResponse.json(
      { success: false, error: "No puedes eliminar tu propia cuenta" },
      { status: 400 }
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
});
