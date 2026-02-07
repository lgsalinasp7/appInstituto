/**
 * Suspend Tenant API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import { withPlatformAdmin } from '@/lib/api-auth';

interface Params {
  params: Promise<Record<string, string>>;
}

// POST /api/admin/tenants/[id]/suspend
export const POST = withPlatformAdmin(['SUPER_ADMIN'], async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const tenant = await TenantsService.suspend(id);

  return NextResponse.json({
    success: true,
    data: tenant,
    message: 'Tenant suspendido correctamente'
  });
});
