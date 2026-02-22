// GET /api/funnel/pipeline - Obtener pipeline completo

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { FunnelService } from '@/modules/funnel';
import { pipelineFiltersSchema } from '@/modules/funnel/schemas';

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  try {
    const { searchParams } = new URL(request.url);

    // Parsear filtros opcionales
    const filters: any = {};

    if (searchParams.get('stage')) filters.stage = searchParams.get('stage');
    if (searchParams.get('temperature')) filters.temperature = searchParams.get('temperature');
    if (searchParams.get('source')) filters.source = searchParams.get('source');
    if (searchParams.get('advisorId')) filters.advisorId = searchParams.get('advisorId');
    if (searchParams.get('search')) filters.search = searchParams.get('search');
    if (searchParams.get('dateFrom')) filters.dateFrom = searchParams.get('dateFrom');
    if (searchParams.get('dateTo')) filters.dateTo = searchParams.get('dateTo');

    // Validar filtros
    const validatedFilters = pipelineFiltersSchema.parse(filters);

    const pipeline = await FunnelService.getPipeline(tenantId, validatedFilters);

    return NextResponse.json({
      success: true,
      data: pipeline,
    });
  } catch (error: any) {
    console.error('[API] Error getting pipeline:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener pipeline' },
      { status: 500 }
    );
  }
});
