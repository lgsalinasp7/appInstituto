/**
 * Reset Admin Password API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';
import { withPlatformAdmin } from '@/lib/api-auth';
import { PlatformRole } from '@prisma/client';
import { withCSRF } from '@/lib/api-auth';

interface Params {
  params: Promise<Record<string, string>>;
}

// POST /api/admin/tenants/[id]/reset-password
export const POST = withCSRF(withPlatformAdmin(['SUPER_ADMIN'], async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const body = await request.json();

  // Generate temporary password if not provided
  const tempPassword = body.password || generateTempPassword();

  const result = await TenantsService.resetAdminPassword(id, tempPassword);

  return NextResponse.json({
    success: true,
    data: result,
    message: 'Contraseña restablecida correctamente'
  });
}));

// Generate a random temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
