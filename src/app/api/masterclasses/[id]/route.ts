/**
 * API Admin: Masterclass Individual
 * GET /api/masterclasses/[id] - Obtener masterclass
 * PUT /api/masterclasses/[id] - Actualizar masterclass
 * DELETE /api/masterclasses/[id] - Eliminar masterclass
 */

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { MasterclassService, updateMasterclassSchema } from '@/modules/masterclass';
import { ZodError } from 'zod';

export const GET = withTenantAuth(async (req: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  try {
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Contexto inválido' },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const masterclass = await MasterclassService.getById(id, tenantId);

    if (!masterclass) {
      return NextResponse.json(
        { success: false, error: 'Masterclass no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: masterclass,
    });
  } catch (error) {
    console.error('Error fetching masterclass:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener masterclass' },
      { status: 500 }
    );
  }
});

export const PUT = withTenantAuthAndCSRF(async (req: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  try {
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Contexto inválido' },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    // Validar datos
    const validated = updateMasterclassSchema.parse(body);

    // Actualizar masterclass
    const masterclass = await MasterclassService.update(id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: masterclass,
      message: 'Masterclass actualizada exitosamente',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating masterclass:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar masterclass' },
      { status: 500 }
    );
  }
});

export const DELETE = withTenantAuthAndCSRF(async (req: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  try {
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Contexto inválido' },
        { status: 400 }
      );
    }

    const { id } = await context.params;

    // Eliminar masterclass
    await MasterclassService.delete(id, tenantId);

    return NextResponse.json({
      success: true,
      message: 'Masterclass eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting masterclass:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar masterclass' },
      { status: 500 }
    );
  }
});
