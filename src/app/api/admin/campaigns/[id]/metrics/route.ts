/**
 * Campaign Metrics API Route
 * GET /api/admin/campaigns/[id]/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
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

      const metrics = await KaledCampaignService.getCampaignMetrics(id);

      return NextResponse.json({
        success: true,
        data: metrics,
      });
    } catch (error: unknown) {
      console.error('Error getting campaign metrics:', error);
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
