/**
 * API Routes for Individual Tenant Operations
 * Super-admin only endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import type { UpdateTenantData } from '@/modules/tenants';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/admin/tenants/[id] - Get tenant by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenant = await TenantsService.getById(id);

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener el tenant' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tenants/[id] - Update tenant
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: UpdateTenantData = await request.json();

    // Check slug availability if changing
    if (body.slug) {
      const slugAvailable = await TenantsService.isSlugAvailable(body.slug, id);
      if (!slugAvailable) {
        return NextResponse.json(
          { success: false, error: 'El slug ya está en uso' },
          { status: 400 }
        );
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(body.slug)) {
        return NextResponse.json(
          { success: false, error: 'El slug solo puede contener letras minúsculas, números y guiones' },
          { status: 400 }
        );
      }
    }

    const tenant = await TenantsService.update(id, body);

    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el tenant' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tenants/[id] - Delete (cancel) tenant
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await TenantsService.delete(id);

    return NextResponse.json({ success: true, message: 'Tenant cancelado correctamente' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el tenant' },
      { status: 500 }
    );
  }
}
