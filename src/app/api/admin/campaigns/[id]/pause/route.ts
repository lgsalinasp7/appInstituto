/**
 * Pause Campaign API Route
 * POST /api/admin/campaigns/[id]/pause
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_campaigns_pause');
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

      const campaign = await KaledCampaignService.pauseCampaign(id);

      logApiSuccess(ctx, 'admin_campaigns_pause', {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        data: campaign,
        message: 'Campaña pausada correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_campaigns_pause', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al pausar la campaña',
        },
        { status: 500 }
      );
    }
  }
);
