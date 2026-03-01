/**
 * Products API Routes
 * GET  /api/admin/products - List active product templates
 * POST /api/admin/products - Create product template
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { ProductsService } from '@/modules/products';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().optional(),
  icon: z.string().optional(),
  domain: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  darkMode: z.boolean().optional(),
  footerText: z.string().optional(),
  adminName: z.string().optional(),
  adminEmail: z.string().email().optional(),
  plan: z.string().optional(),
  allowPublicRegistration: z.boolean().optional(),
});

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async () => {
    try {
      const products = await ProductsService.getAll();
      return NextResponse.json({ success: true, data: products });
    } catch (error: any) {
      console.error('Error getting products:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error al obtener productos' },
        { status: 500 }
      );
    }
  }
);

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validation = createProductSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const product = await ProductsService.create(validation.data);
      return NextResponse.json(
        { success: true, data: product, message: 'Producto creado correctamente' },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error al crear producto' },
        { status: 500 }
      );
    }
  }
);
