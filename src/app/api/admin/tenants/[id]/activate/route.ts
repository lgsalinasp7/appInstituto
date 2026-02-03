/**
 * Activate Tenant API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/admin/tenants/[id]/activate
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenant = await TenantsService.activate(id);

    return NextResponse.json({
      success: true,
      data: tenant,
      message: 'Tenant activado correctamente'
    });
  } catch (error) {
    console.error('Error activating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al activar el tenant' },
      { status: 500 }
    );
  }
}
