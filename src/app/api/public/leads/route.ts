/**
 * API Pública: Captura de Leads
 * POST /api/public/leads - Capturar lead desde landing page
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicLeadService, publicLeadCaptureSchema } from '@/modules/masterclass';
import { ZodError } from 'zod';
import { getTenantIdFromHeader } from '@/lib/tenant-utils';

export async function POST(req: NextRequest) {
  try {
    // Obtener tenantId del header
    const tenantId = await getTenantIdFromHeader(req);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validar datos
    const validated = publicLeadCaptureSchema.parse(body);

    // Capturar lead
    const result = await PublicLeadService.captureLead(validated, tenantId);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Registro exitoso',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error capturing lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar registro' },
      { status: 500 }
    );
  }
}
