// POST /api/funnel/scoring/[id] - Recalcular score de un lead

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuthAndCSRF } from '@/lib/api-auth';
import { LeadScoringService } from '@/modules/funnel';

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  try {
    const params = context?.params ? await context.params : {};
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }

    const result = await LeadScoringService.recalculate(id, tenantId);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Score recalculado exitosamente',
    });
  } catch (error: any) {
    console.error('[API] Error recalculating score:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
