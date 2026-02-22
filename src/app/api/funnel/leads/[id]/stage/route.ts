// PATCH /api/funnel/leads/[id]/stage - Mover lead a nueva etapa

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuthAndCSRF } from '@/lib/api-auth';
import { moveStageSchema } from '@/modules/funnel/schemas';
import { FunnelService } from '@/modules/funnel';

export const PATCH = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  try {
    const params = context?.params ? await context.params : {};
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { newStage, reason } = moveStageSchema.parse(body);

    const updatedLead = await FunnelService.moveLeadToStage(id, newStage, tenantId, reason);

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: `Lead movido a ${newStage}`,
    });
  } catch (error: any) {
    console.error('[API] Error moving lead stage:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
