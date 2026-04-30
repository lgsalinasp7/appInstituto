/**
 * Campaign Metrics API Route
 * GET /api/admin/campaigns/[id]/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_campaigns_metrics');
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

      const metrics = await KaledCampaignService.getCampaignMetrics(id);

      logApiSuccess(ctx, 'admin_campaigns_metrics', {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        data: metrics,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_metrics', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al obtener las métricas de la campaña',
        },
        { status: 500 }
      );
    }
  }
);
