/**
 * Edit Tenant User API Route
 * PATCH: Edit user of a tenant (name, email, temp password)
 * Only platform SUPER_ADMIN can edit tenant users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPlatformAdmin, withCSRF } from '@/lib/api-auth';
import { PlatformRole } from '@prisma/client';

interface Params {
  params: Promise<Record<string, string>>;
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const PATCH = withCSRF(
  withPlatformAdmin(
    ['SUPER_ADMIN'],
    async (request: NextRequest, _user, context?: Params) => {
      const { tenantId, userId } = await context!.params;
      const body = await request.json();

      const { name, email, tempPassword, setTempPassword } = body as {
        name?: string;
        email?: string;
        tempPassword?: string;
        setTempPassword?: boolean;
      };

      // Validate user belongs to tenant
      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId },
        select: {
          id: true,
          email: true,
          name: true,
          platformRole: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado en este tenant' },
          { status: 404 }
        );
      }

      // Do not allow editing platform SUPER_ADMIN
      if (user.platformRole === PlatformRole.SUPER_ADMIN) {
        return NextResponse.json(
          { success: false, error: 'No se puede editar al super administrador' },
          { status: 403 }
        );
      }

      // Check email uniqueness if changing
      if (email && email !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email },
        });
        if (existing) {
          return NextResponse.json(
            { success: false, error: 'El email ya está en uso por otro usuario' },
            { status: 400 }
          );
        }
      }

      const bcrypt = await import('bcryptjs');
      let finalTempPassword: string | undefined;
      const updateData: Record<string, unknown> = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;

      // Handle temp password: either provided or generate when setTempPassword
      if (tempPassword || setTempPassword) {
        const passwordToUse = tempPassword || generateTempPassword();
        const hashedPassword = await bcrypt.hash(passwordToUse, 10);
        updateData.password = hashedPassword;
        updateData.mustChangePassword = true;
        finalTempPassword = passwordToUse;
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          role: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          isActive: updated.isActive,
          role: updated.role,
          createdAt: updated.createdAt,
          ...(finalTempPassword && { tempPassword: finalTempPassword }),
        },
        message: 'Usuario actualizado correctamente',
      });
    }
  )
);
