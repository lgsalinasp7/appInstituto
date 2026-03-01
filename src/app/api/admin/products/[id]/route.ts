/**
 * Product Template Individual API Routes
 * GET    /api/admin/products/[id] - Get product by ID
 * PUT    /api/admin/products/[id] - Update product
 * DELETE /api/admin/products/[id] - Soft delete product
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { ProductsService } from '@/modules/products';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  domain: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  darkMode: z.boolean().optional(),
  footerText: z.string().nullable().optional(),
  adminName: z.string().nullable().optional(),
  adminEmail: z.string().email().nullable().optional(),
  plan: z.string().optional(),
  allowPublicRegistration: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
      const id = params.id;

      const product = await ProductsService.getById(id);
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Producto no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: product });
    } catch (error: any) {
      console.error('Error getting product:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error al obtener producto' },
        { status: 500 }
      );
    }
  }
);

export const PUT = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
      const id = params.id;

      const body = await request.json();
      const validation = updateProductSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const product = await ProductsService.update(id, validation.data);
      return NextResponse.json({
        success: true,
        data: product,
        message: 'Producto actualizado correctamente',
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error al actualizar producto' },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
      const id = params.id;

      await ProductsService.delete(id);
      return NextResponse.json({
        success: true,
        message: 'Producto desactivado correctamente',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error al desactivar producto' },
        { status: 500 }
      );
    }
  }
);
