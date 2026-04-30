/**
 * Campaigns API Routes
 * GET /api/admin/campaigns - List all campaigns
 * POST /api/admin/campaigns - Create new campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';
import { z } from 'zod';
import type { CampaignTimeline } from '@/modules/kaled-crm/types';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeline: z.unknown().optional(),
});

// GET /api/admin/campaigns
export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest) => {
    const ctx = logApiStart(request, 'admin_campaigns_list');
    const startedAt = Date.now();
    try {
      const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));
      const campaigns = await KaledCampaignService.getAllCampaigns(tenantId);

      logApiSuccess(ctx, 'admin_campaigns_list', {
        duration: Date.now() - startedAt,
        recordCount: campaigns.length,
      });
      return NextResponse.json({
        success: true,
        data: campaigns,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_list', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al obtener las campañas',
        },
        { status: 500 }
      );
    }
  }
);

// POST /api/admin/campaigns
export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest) => {
    const ctx = logApiStart(request, 'admin_campaigns_create');
    const startedAt = Date.now();
    try {
      const body = await request.json();

      // Validar datos
      const validation = createCampaignSchema.safeParse(body);
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

      const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));
      const campaign = await KaledCampaignService.createCampaign(tenantId, {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        timeline: data.timeline as CampaignTimeline | undefined,
      });

      logApiSuccess(ctx, 'admin_campaigns_create', {
        duration: Date.now() - startedAt,
        resultId: campaign.id,
      });
      return NextResponse.json({
        success: true,
        data: campaign,
        message: 'Campaña creada correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_create', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al crear la campaña',
        },
        { status: 500 }
      );
    }
  }
);
