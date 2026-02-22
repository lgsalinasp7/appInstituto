/**
 * API Pública: Masterclass por Slug
 * GET /api/public/masterclass/[slug] - Obtener info pública de masterclass
 * POST /api/public/masterclass/[slug] - Registrar lead a masterclass
 */

import { NextRequest, NextResponse } from 'next/server';
import { MasterclassService, PublicLeadService, publicLeadCaptureSchema } from '@/modules/masterclass';
import { ZodError } from 'zod';
import { getTenantIdFromHeader } from '@/lib/tenant-utils';

export async function GET(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
  try {
    const tenantId = await getTenantIdFromHeader(req);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 400 }
      );
    }

    const { slug } = await context.params;
    const masterclass = await MasterclassService.getBySlug(slug, tenantId);

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
}

export async function POST(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
  try {
    const tenantId = await getTenantIdFromHeader(req);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 400 }
      );
    }

    const { slug } = await context.params;
    const body = await req.json();

    // Validar que la masterclass existe
    const masterclass = await MasterclassService.getBySlug(slug, tenantId);
    if (!masterclass) {
      return NextResponse.json(
        { success: false, error: 'Masterclass no encontrada' },
        { status: 404 }
      );
    }

    // Validar datos del lead
    const validated = publicLeadCaptureSchema.parse(body);

    // Registrar lead con masterclassSlug
    const result = await PublicLeadService.captureLead(
      { ...validated, masterclassSlug: slug },
      tenantId
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Registro a masterclass exitoso',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error registering to masterclass:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar registro' },
      { status: 500 }
    );
  }
}
