/**
 * API Routes for Individual Tenant Operations
 * Super-admin only endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import type { UpdateTenantData } from '@/modules/tenants';
import { withPlatformAdmin } from '@/lib/api-auth';

interface Params {
  params: Promise<Record<string, string>>;
}

// GET /api/admin/tenants/[id] - Get tenant by ID
export const GET = withPlatformAdmin(['SUPER_ADMIN', 'ASESOR_COMERCIAL'], async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const tenant = await TenantsService.getById(id);

  if (!tenant) {
    return NextResponse.json(
      { success: false, error: 'Tenant no encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: tenant });
});

// PUT /api/admin/tenants/[id] - Update tenant
export const PUT = withPlatformAdmin(['SUPER_ADMIN', 'ASESOR_COMERCIAL'], async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
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
});

// DELETE /api/admin/tenants/[id] - Delete (cancel) tenant
export const DELETE = withPlatformAdmin(['SUPER_ADMIN'], async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  await TenantsService.delete(id);

  return NextResponse.json({ success: true, message: 'Tenant cancelado correctamente' });
});
