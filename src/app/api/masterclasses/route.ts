/**
 * API Admin: Masterclasses
 * GET /api/masterclasses - Listar masterclasses
 * POST /api/masterclasses - Crear masterclass
 */

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { MasterclassService, createMasterclassSchema } from '@/modules/masterclass';
import { ZodError } from 'zod';

export const GET = withTenantAuth(async (req: NextRequest, user, tenantId) => {
  try {
    const masterclasses = await MasterclassService.getAll(tenantId);

    return NextResponse.json({
      success: true,
      data: masterclasses,
    });
  } catch (error) {
    console.error('Error fetching masterclasses:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener masterclasses' },
      { status: 500 }
    );
  }
});

export const POST = withTenantAuthAndCSRF(async (req: NextRequest, user, tenantId) => {
  try {
    const body = await req.json();

    // Validar datos
    const validated = createMasterclassSchema.parse(body);

    // Crear masterclass
    const masterclass = await MasterclassService.create({
      ...validated,
      tenant: { connect: { id: tenantId } },
    });

    return NextResponse.json({
      success: true,
      data: masterclass,
      message: 'Masterclass creada exitosamente',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating masterclass:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear masterclass' },
      { status: 500 }
    );
  }
});
