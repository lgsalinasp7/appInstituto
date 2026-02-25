/**
 * Analytics Overview API Route
 * GET /api/admin/analytics/overview
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledAnalyticsService } from '@/modules/kaled-crm/services/kaled-analytics.service';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest) => {
    try {
      const metrics = await KaledAnalyticsService.getOverviewMetrics();

      return NextResponse.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error getting overview metrics:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener las métricas',
        },
        { status: 500 }
      );
    }
  }
);
