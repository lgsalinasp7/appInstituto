import { headers } from 'next/headers';
import { prisma } from './prisma';

/**
 * Retrieves the tenant slug from the 'x-tenant-slug' header (set by middleware).
 */
export async function getTenantSlug(): Promise<string | null> {
    const headerList = await headers();
    return headerList.get('x-tenant-slug');
}

/**
 * Retrieves the full Tenant object based on the current subdomain.
 */
export async function getCurrentTenant() {
    const slug = await getTenantSlug();
    if (!slug) return null;

    return prisma.tenant.findUnique({
        where: { slug },
    });
}

/**
 * Helper to get the tenant ID directly for queries.
 */
export async function getCurrentTenantId(): Promise<string | null> {
    const tenant = await getCurrentTenant();
    return tenant?.id || null;
}
