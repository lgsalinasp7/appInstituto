/**
 * API: Admin Branding Management
 * GET /api/admin/tenants/[id]/branding - Obtener branding de un tenant
 * PUT /api/admin/tenants/[id]/branding - Actualizar branding de un tenant
 *
 * Solo accesible por SUPER_ADMIN de la plataforma
 */

import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPlatformAdmin, withCSRF } from "@/lib/api-auth";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";
import { z } from "zod";

const brandingUpdateSchema = z.object({
  logoUrl: z.string().url({ error: "URL de logo invalida" }).nullable().optional(),
  faviconUrl: z.string().url({ error: "URL de favicon invalida" }).nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Color primario debe ser hex (#RRGGBB)" }).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Color secundario debe ser hex (#RRGGBB)" }).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Color de acento debe ser hex (#RRGGBB)" }).optional(),
  fontFamily: z.string().min(1, { error: "Familia de fuente requerida" }).max(100).optional(),
  loginBgImage: z.string().url({ error: "URL de imagen de fondo invalida" }).nullable().optional(),
  loginBgGradient: z.string().max(500).nullable().optional(),
  footerText: z.string().max(200).nullable().optional(),
  customCss: z.string().max(5000).nullable().optional(),
  darkMode: z.boolean().optional(),
});

export const GET = withPlatformAdmin(
  ["SUPER_ADMIN"],
  async (request, user, context) => {
    const startTime = Date.now();
    const { id: tenantId } = await context!.params;

    const ctx = logApiStart(request, "admin_obtener_branding", {
      params: { tenantId },
    }, { userId: user.id });

    try {
      // Verificar que el tenant existe
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, slug: true },
      });

      if (!tenant) {
        return NextResponse.json(
          { error: "Tenant no encontrado" },
          { status: 404 }
        );
      }

      // Obtener o crear branding con defaults
      let branding = await prisma.tenantBranding.findUnique({
        where: { tenantId },
      });

      if (!branding) {
        branding = await prisma.tenantBranding.create({
          data: { tenantId },
        });
      }

      const response = NextResponse.json({
        tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
        branding,
      });

      after(() => {
        logApiSuccess(ctx, "admin_obtener_branding", {
          duration: Date.now() - startTime,
          resultId: branding.id,
          metadata: { tenantName: tenant.name, tenantSlug: tenant.slug },
        });
      });

      return response;
    } catch (error) {
      logApiError(ctx, "admin_obtener_branding", { error });
      throw error;
    }
  }
);

export const PUT = withCSRF(
  withPlatformAdmin(
    ["SUPER_ADMIN"],
    async (request, user, context) => {
      const startTime = Date.now();
      const { id: tenantId } = await context!.params;
      const body = await request.json();

      const ctx = logApiStart(request, "admin_actualizar_branding", {
        params: { tenantId },
        body,
      }, { userId: user.id });

      try {
        // Validar datos
        const data = brandingUpdateSchema.parse(body);

        // Verificar que el tenant existe
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { id: true, name: true },
        });

        if (!tenant) {
          return NextResponse.json(
            { error: "Tenant no encontrado" },
            { status: 404 }
          );
        }

        // Upsert branding
        const branding = await prisma.tenantBranding.upsert({
          where: { tenantId },
          update: data,
          create: {
            tenantId,
            ...data,
          },
        });

        const response = NextResponse.json({
          message: "Branding actualizado correctamente",
          branding,
        });

        after(() => {
          logApiSuccess(ctx, "admin_actualizar_branding", {
            duration: Date.now() - startTime,
            resultId: branding.id,
            metadata: {
              tenantName: tenant.name,
              updatedFields: Object.keys(data),
            },
          });
        });

        return response;
      } catch (error) {
        logApiError(ctx, "admin_actualizar_branding", { error });
        throw error;
      }
    }
  )
);
