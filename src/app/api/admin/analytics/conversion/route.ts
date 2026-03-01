/**
 * Analytics Conversion API Route
 * GET /api/admin/analytics/conversion
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledAnalyticsService } from '@/modules/kaled-crm/services/kaled-analytics.service';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest) => {
    try {
      const tenantId = await resolveKaledTenantId(
        request.nextUrl.searchParams.get('tenantId')
      );
      const metrics = await KaledAnalyticsService.getConversionMetrics(tenantId);

      return NextResponse.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error getting conversion metrics:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener las métricas de conversión',
        },
        { status: 500 }
      );
    }
  }
);
