/**
 * API: Tenant Branding
 * GET /api/tenant/branding - Obtener branding del tenant actual
 *
 * Accesible por cualquier usuario autenticado del tenant
 * Usado por Client Components para obtener datos de branding
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenantAuth } from "@/lib/api-auth";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

export const GET = withTenantAuth(async (request, user, tenantId) => {
  const startTime = Date.now();

  const ctx = logApiStart(request, "obtener_branding_tenant", {
    params: { tenantId },
  }, { userId: user.id, tenantId });

  try {
    const [branding, tenant] = await Promise.all([
      prisma.tenantBranding.findUnique({
        where: { tenantId },
        select: {
          logoUrl: true,
          faviconUrl: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          fontFamily: true,
          loginBgImage: true,
          loginBgGradient: true,
          footerText: true,
          darkMode: true,
        },
      }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, slug: true },
      }),
    ]);

    // Valores por defecto si no hay branding
    const result = {
      tenantName: tenant?.name || "Plataforma",
      tenantSlug: tenant?.slug || "",
      logoUrl: branding?.logoUrl || null,
      faviconUrl: branding?.faviconUrl || null,
      primaryColor: branding?.primaryColor || "#1e3a5f",
      secondaryColor: branding?.secondaryColor || "#3b82f6",
      accentColor: branding?.accentColor || "#10b981",
      fontFamily: branding?.fontFamily || "Inter",
      loginBgImage: branding?.loginBgImage || null,
      loginBgGradient: branding?.loginBgGradient || null,
      footerText: branding?.footerText || null,
      darkMode: branding?.darkMode || false,
    };

    logApiSuccess(ctx, "obtener_branding_tenant", {
      duration: Date.now() - startTime,
      metadata: { hasBranding: !!branding, tenantName: tenant?.name },
    });

    return NextResponse.json(result);
  } catch (error) {
    logApiError(ctx, "obtener_branding_tenant", { error });
    throw error;
  }
});
