/**
 * Update Tenant User API Route
 * PATCH /api/admin/tenants/[id]/users/[userId]
 */

import { NextRequest, NextResponse } from "next/server";
import { TenantsService } from "@/modules/tenants";
import { withPlatformAdmin, withCSRF } from "@/lib/api-auth";

export const PATCH = withCSRF(
  withPlatformAdmin(
    ["SUPER_ADMIN"],
    async (
      request: NextRequest,
      _user,
      context?: { params: Promise<Record<string, string>> }
    ) => {
      try {
        const params = await context!.params;
        const tenantId = params.id;
        const userId = params.userId;

        if (!tenantId || !userId) {
          return NextResponse.json(
            { success: false, error: "tenantId y userId requeridos" },
            { status: 400 }
          );
        }

        const body = await request.json();
        const result = await TenantsService.updateTenantUser(tenantId, userId, {
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
        const message =
          err instanceof Error ? err.message : "Error al actualizar usuario";
        return NextResponse.json(
          { success: false, error: message },
          { status: 400 }
        );
      }
    }
  )
);
