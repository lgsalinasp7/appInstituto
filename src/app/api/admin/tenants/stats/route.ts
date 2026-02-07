/**
 * Tenant Stats API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import { withPlatformAdmin } from '@/lib/api-auth';

// GET /api/admin/tenants/stats
export const GET = withPlatformAdmin(['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'], async (request: NextRequest, user) => {
  const stats = await TenantsService.getStats();

  return NextResponse.json({ success: true, data: stats });
});
