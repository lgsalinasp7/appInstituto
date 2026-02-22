// PATCH /api/funnel/leads/[id]/assign - Asignar lead a asesor

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuthAndCSRF } from '@/lib/api-auth';
import { z } from 'zod';
import { FunnelService } from '@/modules/funnel';
import { prisma } from '@/lib/prisma';

const assignSchema = z.object({
  advisorId: z.string().cuid(),
});

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
    const { advisorId } = assignSchema.parse(body);

    // Verificar que el advisor pertenece al tenant
    const advisor = await prisma.user.findUnique({
      where: { id: advisorId, tenantId },
    });

    if (!advisor) {
      return NextResponse.json(
        { success: false, error: 'Asesor no encontrado' },
        { status: 404 }
      );
    }

    const updatedLead = await FunnelService.assignToAdvisor(id, advisorId, tenantId);

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: 'Lead asignado exitosamente',
    });
  } catch (error: any) {
    console.error('[API] Error assigning lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
