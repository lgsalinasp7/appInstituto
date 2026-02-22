// GET /api/funnel/leads - Listar leads
// POST /api/funnel/leads - Crear lead

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { createLeadSchema } from '@/modules/funnel/schemas';
import { LeadScoringService, FunnelService } from '@/modules/funnel';

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.prospect.findMany({
        where: { tenantId },
        include: {
          program: { select: { name: true } },
          advisor: { select: { name: true } },
        },
        orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.prospect.count({
        where: { tenantId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[API] Error getting leads:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
  try {
    const body = await request.json();
    const validated = createLeadSchema.parse(body);

    // Si no se especifica advisor, obtener siguiente disponible
    let advisorId = validated.advisorId || user.id;

    if (!validated.advisorId) {
      try {
        advisorId = await FunnelService.getNextAdvisor(tenantId);
      } catch {
        // Si no hay asesores, usar el usuario actual
        advisorId = user.id;
      }
    }

    // Crear lead
    const lead = await prisma.prospect.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        source: validated.source,
        sourceDetail: validated.sourceDetail,
        programId: validated.programId,
        advisorId,
        city: validated.city,
        occupation: validated.occupation,
        observations: validated.observations,
        utmSource: validated.utmSource,
        utmMedium: validated.utmMedium,
        utmCampaign: validated.utmCampaign,
        utmContent: validated.utmContent,
        tenantId,
        funnelStage: 'NUEVO',
        temperature: 'FRIO',
      },
      include: {
        program: { select: { name: true } },
        advisor: { select: { name: true } },
      },
    });

    // Crear interacción inicial
    await prisma.prospectInteraction.create({
      data: {
        type: 'SISTEMA',
        content: 'Lead creado en el sistema',
        metadata: { source: validated.source },
        prospectId: lead.id,
        tenantId,
      },
    });

    // Calcular score inicial
    await LeadScoringService.recalculate(lead.id, tenantId);

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead creado exitosamente',
    });
  } catch (error: any) {
    console.error('[API] Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
