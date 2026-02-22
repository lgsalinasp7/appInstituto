// GET /api/funnel/leads/[id]/timeline - Obtener timeline de actividad

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { FunnelService } from '@/modules/funnel';

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  try {
    const params = context?.params ? await context.params : {};
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }

    const timeline = await FunnelService.getLeadTimeline(id, tenantId);

    return NextResponse.json({
      success: true,
      data: timeline,
    });
  } catch (error: any) {
    console.error('[API] Error getting timeline:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
