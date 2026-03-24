/**
 * Update Tenant User API Route
 * PATCH /api/admin/tenants/[id]/users/[userId]
 *
 * Permite: SUPER_ADMIN de plataforma (sin tenant) o ACADEMY_ADMIN del mismo tenant.
 */

import { NextRequest, NextResponse } from "next/server";
import { TenantsService } from "@/modules/tenants";
import { withCSRF } from "@/lib/api-auth";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const PATCH = withCSRF(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Debe iniciar sesión" }, { status: 401 });
    }

    const params = await context!.params;
    const tenantIdParam = params.id;
    const targetUserId = params.userId;

    if (!tenantIdParam || !targetUserId) {
      return NextResponse.json(
        { success: false, error: "tenantId y userId requeridos" },
        { status: 400 }
      );
    }

    const actor = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { tenantId: true, platformRole: true },
    });

    const isPlatformSuperAdmin = !actor?.tenantId && actor?.platformRole === "SUPER_ADMIN";
    const isAcademyAdminOfThisTenant =
      actor?.tenantId === tenantIdParam && actor?.platformRole === "ACADEMY_ADMIN";

    if (!isPlatformSuperAdmin && !isAcademyAdminOfThisTenant) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tienes permisos para editar usuarios de este instituto (se requiere super administrador de plataforma o administrador de academia del mismo tenant).",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = await TenantsService.updateTenantUser(tenantIdParam, targetUserId, {
      name: body.name,
      email: body.email,
      setTempPassword: body.setTempPassword,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Usuario actualizado correctamente",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al actualizar usuario";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
});
