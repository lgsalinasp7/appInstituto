/**
 * Complete Campaign API Route
 * POST /api/admin/campaigns/[id]/complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
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

      const campaign = await KaledCampaignService.completeCampaign(id);

      return NextResponse.json({
        success: true,
        data: campaign,
        message: 'Campaña completada correctamente',
      });
    } catch (error: any) {
      console.error('Error completing campaign:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al completar la campaña',
        },
        { status: 500 }
      );
    }
  }
);
