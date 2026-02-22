// GET /api/funnel/analytics/conversion - Datos para gráfico de conversión

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { FunnelAnalyticsService } from '@/modules/funnel';

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  try {
    const conversionData = await FunnelAnalyticsService.getConversionFunnel(tenantId);

    return NextResponse.json({
      success: true,
      data: conversionData,
    });
  } catch (error: any) {
    console.error('[API] Error getting conversion data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
