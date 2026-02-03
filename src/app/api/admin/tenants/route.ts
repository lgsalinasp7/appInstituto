/**
 * API Routes for Tenant Management
 * Super-admin only endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import type { TenantFilters, CreateTenantData } from '@/modules/tenants';

// GET /api/admin/tenants - List all tenants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: TenantFilters = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as TenantFilters['status']) || undefined,
      plan: searchParams.get('plan') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await TenantsService.getAll(filters);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener los tenants' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tenants - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const body: CreateTenantData = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Nombre, slug y email son requeridos' },
        { status: 400 }
      );
    }

    // Check slug availability
    const slugAvailable = await TenantsService.isSlugAvailable(body.slug);
    if (!slugAvailable) {
      return NextResponse.json(
        { success: false, error: 'El slug ya está en uso' },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { success: false, error: 'El slug solo puede contener letras minúsculas, números y guiones' },
        { status: 400 }
      );
    }

    const tenant = await TenantsService.create(body);

    return NextResponse.json({ success: true, data: tenant }, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el tenant' },
      { status: 500 }
    );
  }
}
