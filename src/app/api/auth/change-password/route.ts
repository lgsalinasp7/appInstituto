/**
 * Change Password API Route
 * POST: Change password for the authenticated user
 * Used when mustChangePassword is true or for voluntary password change
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthAndCSRF } from '@/lib/api-auth';
import { AuthService } from '@/modules/auth/services/auth.service';

export const POST = withAuthAndCSRF(async (request, user) => {
  const body = await request.json();
  const { currentPassword, newPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { success: false, error: 'Contraseña actual y nueva son requeridas' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres' },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });

  if (!dbUser?.password) {
    return NextResponse.json(
      { success: false, error: 'No se puede cambiar la contraseña de este usuario' },
      { status: 400 }
    );
  }

  const isValid = await AuthService.verifyPassword(currentPassword, dbUser.password);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'Contraseña actual incorrecta' },
      { status: 400 }
    );
  }

  const hashedPassword = await AuthService.hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Contraseña actualizada correctamente',
  });
});
