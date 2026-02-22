/**
 * Tenant Utilities
 * Funciones para obtener tenant desde headers en Server Components y API Routes
 */

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

/**
 * Obtener tenantId desde headers en Server Components
 * Usar en páginas Server Component que son públicas (no requieren auth)
 */
export async function getTenantIdFromServerRequest(): Promise<string | null> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');

  if (!tenantSlug) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  return tenant?.id || null;
}

/**
 * Obtener tenantId desde headers en API Routes (sin auth)
 * Usar en API routes públicas (ej: /api/public/*)
 */
export async function getTenantIdFromHeader(req: NextRequest): Promise<string | null> {
  const tenantSlug = req.headers.get('x-tenant-slug');

  if (!tenantSlug) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  return tenant?.id || null;
}
