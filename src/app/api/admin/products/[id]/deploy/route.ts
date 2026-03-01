/**
 * Deploy Product Template API Route
 * POST /api/admin/products/[id]/deploy - Deploy a tenant from a product template
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { ProductsService } from '@/modules/products';
import { z } from 'zod';

const deploySchema = z.object({
  tenantName: z.string().min(1, 'El nombre del tenant es requerido'),
  tenantSlug: z.string()
    .min(1, 'El slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  adminEmail: z.string().email('Email inválido'),
  adminName: z.string().optional(),
  adminPassword: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional()
  ),
  autoGeneratePassword: z.boolean().optional(),
  domain: z.string().optional(),
});

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
      const productId = params.id;

      const body = await request.json();
      const validation = deploySchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const result = await ProductsService.deploy(productId, validation.data);

      return NextResponse.json({
        success: true,
        data: result,
        message: `Tenant "${validation.data.tenantName}" desplegado correctamente`,
      });
    } catch (error: any) {
      console.error('Error deploying product:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error al desplegar el producto' },
        { status: 500 }
      );
    }
  }
);
