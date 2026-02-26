/**
 * Tenant Utilities
 * Funciones para obtener tenant desde headers en Server Components y API Routes
 */

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

function parseTenantSlugFromHost(host: string): string | null {
  const hostname = host.split(':')[0] || '';
  if (!hostname) {
    return null;
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'kaledsoft.tech';

  // Produccion: tenant.root-domain.com
  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.replace(`.${rootDomain}`, '');
    if (slug && slug !== 'www' && slug !== 'admin') {
      return slug;
    }
  }

  // Desarrollo: tenant.localhost
  if (hostname.includes('.localhost')) {
    const slug = hostname.split('.localhost')[0];
    if (slug && slug !== 'www' && slug !== 'admin') {
      return slug;
    }
  }

  return null;
}

async function findTenantIdBySlug(slug: string): Promise<string | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });

  return tenant?.id || null;
}

/**
 * Obtener tenantId desde headers en Server Components
 * Usar en páginas Server Component que son públicas (no requieren auth)
 */
export async function getTenantIdFromServerRequest(): Promise<string | null> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');

  if (tenantSlug) {
    const tenantId = await findTenantIdBySlug(tenantSlug);
    if (tenantId) {
      return tenantId;
    }
  }

  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const hostTenantSlug = host ? parseTenantSlugFromHost(host) : null;
  if (hostTenantSlug) {
    const tenantId = await findTenantIdBySlug(hostTenantSlug);
    if (tenantId) {
      return tenantId;
    }
  }

  return null;
}

/**
 * Obtener tenantId desde headers en API Routes (sin auth)
 * Usar en API routes públicas (ej: /api/public/*)
 */
export async function getTenantIdFromHeader(req: NextRequest): Promise<string | null> {
  const tenantSlug = req.headers.get('x-tenant-slug');

  if (tenantSlug) {
    const tenantId = await findTenantIdBySlug(tenantSlug);
    if (tenantId) {
      return tenantId;
    }
  }

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const hostTenantSlug = host ? parseTenantSlugFromHost(host) : null;
  if (hostTenantSlug) {
    const tenantId = await findTenantIdBySlug(hostTenantSlug);
    if (tenantId) {
      return tenantId;
    }
  }

  return null;
}
