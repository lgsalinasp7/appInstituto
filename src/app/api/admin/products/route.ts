/**
 * Products API Routes
 * GET  /api/admin/products - List active product templates
 * POST /api/admin/products - Create product template
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { ProductsService } from '@/modules/products';
import { z } from 'zod';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

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
  adminEmail: z.email().optional(),
  plan: z.string().optional(),
  allowPublicRegistration: z.boolean().optional(),
});

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest) => {
    const ctx = logApiStart(request, 'admin_products_list');
    const startedAt = Date.now();
    try {
      const products = await ProductsService.getAll();
      logApiSuccess(ctx, 'admin_products_list', {
        duration: Date.now() - startedAt,
        recordCount: products.length,
      });
      return NextResponse.json({ success: true, data: products });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_products_list', { error });
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al obtener productos' },
        { status: 500 }
      );
    }
  }
);

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest) => {
    const ctx = logApiStart(request, 'admin_products_create');
    const startedAt = Date.now();
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
      logApiSuccess(ctx, 'admin_products_create', {
        duration: Date.now() - startedAt,
        resultId: product.id,
      });
      return NextResponse.json(
        { success: true, data: product, message: 'Producto creado correctamente' },
        { status: 201 }
      );
    } catch (error: unknown) {
      logApiError(ctx, 'admin_products_create', { error });
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al crear producto' },
        { status: 500 }
      );
    }
  }
);
