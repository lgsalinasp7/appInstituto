/**
 * Update Tenant API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import { withPlatformAdmin } from '@/lib/api-auth';
import type { UpdateTenantData } from '@/modules/tenants/types';

// PATCH /api/admin/tenants/[id]
export const PATCH = withPlatformAdmin(['SUPER_ADMIN'], async (request: NextRequest, user, context: any) => {
  const params = await context.params;
  const id = params.id;
  const body = await request.json();

  // Validate and sanitize body
  const updateData: UpdateTenantData = {
    name: body.name,
    slug: body.slug,
    domain: body.domain,
    status: body.status,
    plan: body.plan,
    email: body.email,
    subscriptionEndsAt: body.subscriptionEndsAt ? new Date(body.subscriptionEndsAt) : undefined,
  };

  // Remove undefined values
  Object.keys(updateData).forEach(
    (key) => updateData[key as keyof UpdateTenantData] === undefined && delete updateData[key as keyof UpdateTenantData]
  );

  const tenant = await TenantsService.update(id, updateData);

  return NextResponse.json({
    success: true,
    data: tenant,
    message: 'Tenant actualizado correctamente'
  });
});
