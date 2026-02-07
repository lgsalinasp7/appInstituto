/**
 * Activate Tenant API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import { withPlatformAdmin } from '@/lib/api-auth';

interface Params {
  params: Promise<Record<string, string>>;
}

// POST /api/admin/tenants/[id]/activate
export const POST = withPlatformAdmin(['SUPER_ADMIN', 'ASESOR_COMERCIAL'], async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const tenant = await TenantsService.activate(id);

  return NextResponse.json({
    success: true,
    data: tenant,
    message: 'Tenant activado correctamente'
  });
});
