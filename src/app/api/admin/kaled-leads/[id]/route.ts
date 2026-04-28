/**
 * KaledLead Individual API Routes
 * GET /api/admin/kaled-leads/[id] - Get lead by ID
 * PUT /api/admin/kaled-leads/[id] - Update lead
 * DELETE /api/admin/kaled-leads/[id] - Soft delete lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledLeadService } from '@/modules/masterclass/services/kaled-lead.service';
import { z } from 'zod';
import type { KaledLead } from '@prisma/client';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

const updateLeadSchema = z.object({
  name: z.string().optional(),
  email: z.email('Email inválido').optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
  observations: z.string().optional(),
  filteringData: z.record(z.string(), z.unknown()).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  campaignId: z.string().optional(),
});

// GET /api/admin/kaled-leads/[id]
export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, "admin_kaled_lead_get", undefined, { userId: user.id });
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID del lead es requerido',
          },
          { status: 400 }
        );
      }

      const lead = await KaledLeadService.getLeadById(id);

      if (!lead) {
        return NextResponse.json(
          {
            success: false,
            error: 'Lead no encontrado',
          },
          { status: 404 }
        );
      }

      logApiSuccess(ctx, "admin_kaled_lead_get", { duration: Date.now() - startedAt, resultId: id });
      return NextResponse.json({
        success: true,
        data: lead,
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_kaled_lead_get", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al obtener el lead',
        },
        { status: 500 }
      );
    }
  }
);

// PUT /api/admin/kaled-leads/[id]
export const PUT = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, "admin_kaled_lead_update", undefined, { userId: user.id });
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID del lead es requerido',
          },
          { status: 400 }
        );
      }

      const body = await request.json();

      // Validar datos
      const validation = updateLeadSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      // Actualizar lead
      const lead = await KaledLeadService.updateLead(
        id,
        validation.data as Partial<KaledLead>,
        user.id
      );

      logApiSuccess(ctx, "admin_kaled_lead_update", { duration: Date.now() - startedAt, resultId: id });
      return NextResponse.json({
        success: true,
        data: lead,
        message: 'Lead actualizado correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_kaled_lead_update", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al actualizar el lead',
        },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/kaled-leads/[id]
export const DELETE = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, "admin_kaled_lead_delete", undefined, { userId: user.id });
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID del lead es requerido',
          },
          { status: 400 }
        );
      }

      // Soft delete lead
      await KaledLeadService.deleteLead(id, user.id);

      logApiSuccess(ctx, "admin_kaled_lead_delete", { duration: Date.now() - startedAt, resultId: id });
      return NextResponse.json({
        success: true,
        message: 'Lead eliminado correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_kaled_lead_delete", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al eliminar el lead',
        },
        { status: 500 }
      );
    }
  }
);
