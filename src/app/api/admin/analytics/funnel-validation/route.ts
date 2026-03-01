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
      const metrics = await KaledAnalyticsService.getFunnelValidationMetrics(tenantId);

      return NextResponse.json({
        success: true,
        data: metrics,
      });
    } catch (error: unknown) {
      console.error('Error getting funnel validation metrics:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error al obtener métricas del funnel';
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  }
);
