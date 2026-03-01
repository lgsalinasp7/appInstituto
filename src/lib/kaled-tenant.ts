/**
 * Helper para resolver el tenantId de modelos Kaled* (CRM de plataforma).
 *
 * - Si se pasa un tenantId explícito, valida que exista y esté activo.
 * - Si no se pasa, busca el tenant con slug 'kaledsoft' (con cache).
 */

import { prisma } from '@/lib/prisma';

let cachedKaledTenantId: string | null = null;

/**
 * Resuelve el tenantId para operaciones sobre modelos Kaled*.
 * @param queryTenantId - tenantId explícito (ej. desde query param). Si es null/undefined, usa el tenant 'kaledsoft'.
 * @returns tenantId string
 */
export async function resolveKaledTenantId(
  queryTenantId?: string | null
): Promise<string> {
  // Si se pasa un tenantId explícito, validar que exista
  if (queryTenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: queryTenantId },
      select: { id: true, status: true },
    });

    if (!tenant) {
      throw new Error(`Tenant no encontrado: ${queryTenantId}`);
    }

    if (tenant.status !== 'ACTIVO') {
      throw new Error(`Tenant no está activo: ${queryTenantId}`);
    }

    return tenant.id;
  }

  // Usar cache en memoria para el tenant kaledsoft
  if (cachedKaledTenantId) {
    return cachedKaledTenantId;
  }

  const kaledTenant = await prisma.tenant.findUnique({
    where: { slug: 'kaledsoft' },
    select: { id: true, status: true },
  });

  if (!kaledTenant) {
    throw new Error(
      'Tenant "kaledsoft" no encontrado. Ejecuta el seed para crear el tenant base.'
    );
  }

  cachedKaledTenantId = kaledTenant.id;
  return cachedKaledTenantId;
}

/**
 * Limpia el cache del tenant kaledsoft (útil en tests).
 */
export function clearKaledTenantCache(): void {
  cachedKaledTenantId = null;
}
