/**
 * Endpoint para obtener el usuario autenticado actual
 * Valida la sesión server-side y retorna los datos del usuario
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      platformRole: user.platformRole,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
          }
        : null,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
