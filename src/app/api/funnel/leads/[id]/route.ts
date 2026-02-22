// GET /api/funnel/leads/[id] - Obtener lead
// PUT /api/funnel/leads/[id] - Actualizar lead
// DELETE /api/funnel/leads/[id] - Eliminar lead

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { updateLeadSchema } from '@/modules/funnel/schemas';
import { LeadScoringService } from '@/modules/funnel';

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

    const lead = await prisma.prospect.findUnique({
      where: { id, tenantId },
      include: {
        program: { select: { name: true, totalValue: true } },
        advisor: { select: { name: true, email: true } },
        interactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            advisor: { select: { name: true } },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error('[API] Error getting lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const PUT = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
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
    const validated = updateLeadSchema.parse(body);

    // Verificar que el lead existe y pertenece al tenant
    const existingLead = await prisma.prospect.findUnique({
      where: { id, tenantId },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar lead
    const updatedLead = await prisma.prospect.update({
      where: { id },
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        temperature: validated.temperature,
        observations: validated.observations,
        programId: validated.programId,
        advisorId: validated.advisorId,
        city: validated.city,
        occupation: validated.occupation,
        nextFollowUpAt: validated.nextFollowUpAt
          ? new Date(validated.nextFollowUpAt)
          : undefined,
        lostReason: validated.lostReason,
      },
      include: {
        program: { select: { name: true } },
        advisor: { select: { name: true } },
      },
    });

    // Crear interacción
    await prisma.prospectInteraction.create({
      data: {
        type: 'NOTA',
        content: 'Lead actualizado',
        prospectId: id,
        advisorId: user.id,
        tenantId,
      },
    });

    // Recalcular score
    await LeadScoringService.recalculate(id, tenantId);

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: 'Lead actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('[API] Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});

export const DELETE = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  try {
    const params = context?.params ? await context.params : {};
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }

    // Verificar que el lead existe y pertenece al tenant
    const lead = await prisma.prospect.findUnique({
      where: { id, tenantId },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar lead (cascade eliminará interacciones)
    await prisma.prospect.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('[API] Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
