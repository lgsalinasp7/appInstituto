/**
 * Suspend Tenant API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/admin/tenants/[id]/suspend
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenant = await TenantsService.suspend(id);

    return NextResponse.json({
      success: true,
      data: tenant,
      message: 'Tenant suspendido correctamente'
    });
  } catch (error) {
    console.error('Error suspending tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al suspender el tenant' },
      { status: 500 }
    );
  }
}
