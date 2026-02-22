// GET /api/funnel/analytics - Obtener métricas del embudo

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { FunnelAnalyticsService } from '@/modules/funnel';

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || undefined;

    const metrics = await FunnelAnalyticsService.getFunnelMetrics(tenantId, period);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    console.error('[API] Error getting analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
