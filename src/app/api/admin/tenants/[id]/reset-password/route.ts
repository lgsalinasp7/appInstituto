/**
 * Reset Admin Password API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/admin/tenants/[id]/reset-password
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Generate temporary password if not provided
    const tempPassword = body.password || generateTempPassword();

    const result = await TenantsService.resetAdminPassword(id, tempPassword);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Contraseña restablecida correctamente'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, error: 'Error al restablecer la contraseña' },
      { status: 500 }
    );
  }
}

// Generate a random temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
