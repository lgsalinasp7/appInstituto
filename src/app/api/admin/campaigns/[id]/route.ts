/**
 * Campaign Individual API Routes
 * GET /api/admin/campaigns/[id] - Get campaign by ID
 * PUT /api/admin/campaigns/[id] - Update campaign
 * DELETE /api/admin/campaigns/[id] - Delete campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';
import { z } from 'zod';
import type { CampaignTimeline } from '@/modules/kaled-crm/types';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

const updateCampaignSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeline: z.unknown().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
});

// GET /api/admin/campaigns/[id]
export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_campaigns_get');
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID de la campaña es requerido',
          },
          { status: 400 }
        );
      }

      const campaign = await KaledCampaignService.getCampaignById(id);

      if (!campaign) {
        return NextResponse.json(
          {
            success: false,
            error: 'Campaña no encontrada',
          },
          { status: 404 }
        );
      }

      logApiSuccess(ctx, 'admin_campaigns_get', {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        data: campaign,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_get', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al obtener la campaña',
        },
        { status: 500 }
      );
    }
  }
);

// PUT /api/admin/campaigns/[id]
export const PUT = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_campaigns_update');
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID de la campaña es requerido',
          },
          { status: 400 }
        );
      }

      const body = await request.json();

      // Validar datos
      const validation = updateCampaignSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const data = validation.data;

      const campaign = await KaledCampaignService.updateCampaign(id, {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        timeline: data.timeline as CampaignTimeline | undefined,
        status: data.status,
      });

      logApiSuccess(ctx, 'admin_campaigns_update', {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        data: campaign,
        message: 'Campaña actualizada correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_update', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al actualizar la campaña',
        },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/campaigns/[id]
export const DELETE = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_campaigns_delete');
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID de la campaña es requerido',
          },
          { status: 400 }
        );
      }

      await KaledCampaignService.deleteCampaign(id);

      logApiSuccess(ctx, 'admin_campaigns_delete', {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        message: 'Campaña eliminada correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_delete', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al eliminar la campaña',
        },
        { status: 500 }
      );
    }
  }
);
