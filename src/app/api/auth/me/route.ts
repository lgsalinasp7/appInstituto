/**
 * Endpoint para obtener el usuario autenticado actual
 * Valida la sesión server-side y retorna los datos del usuario
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

export async function GET(request: NextRequest) {
  const ctx = logApiStart(request, "auth_me");
  const startedAt = Date.now();
  try {
    const user = await getCurrentUser();

    if (!user) {
      // Borrar cookie inválida/expirada (solo permitido en Route Handlers)
      await destroySession();
      logApiSuccess(ctx, "auth_me", { duration: Date.now() - startedAt, metadata: { authenticated: false } });
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    logApiSuccess(ctx, "auth_me", { duration: Date.now() - startedAt, resultId: user.id });
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image ?? null,
      tenantId: user.tenantId,
      platformRole: user.platformRole,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
          }
        : null,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
          }
        : null,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      invitationLimit: user.invitationLimit,
    });
  } catch (error) {
    logApiError(ctx, "auth_me", { error });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
