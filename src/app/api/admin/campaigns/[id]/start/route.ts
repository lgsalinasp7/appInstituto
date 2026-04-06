/**
 * Start Campaign API Route
 * POST /api/admin/campaigns/[id]/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
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

      return NextResponse.json({
        success: true,
        data: campaign,
        message: 'Campaña iniciada correctamente',
      });
    } catch (error: unknown) {
      console.error('Error starting campaign:', error);
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
