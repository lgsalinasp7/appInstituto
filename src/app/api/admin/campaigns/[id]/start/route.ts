/**
 * Start Campaign API Route
 * POST /api/admin/campaigns/[id]/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_campaigns_start');
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

      const campaign = await KaledCampaignService.startCampaign(id);

      logApiSuccess(ctx, 'admin_campaigns_start', {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        data: campaign,
        message: 'Campaña iniciada correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_start', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al iniciar la campaña',
        },
        { status: 500 }
      );
    }
  }
);
