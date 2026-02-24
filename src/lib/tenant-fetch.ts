/**
 * Helper para hacer fetch con headers de tenant automáticamente
 * Detecta el subdomain y agrega el header x-tenant-slug
 */

export function getTenantHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return {};
  }

  // Obtener el subdomain si existe
  const hostname = window.location.hostname;
  let subdomain: string | null = null;

  if (hostname.includes('.localhost')) {
    subdomain = hostname.split('.localhost')[0];
  } else if (hostname.includes('.') && !hostname.startsWith('www')) {
    // En producción, extraer el primer segmento del dominio
    const parts = hostname.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Solo agregar el header si hay un subdomain de tenant real.
  // "admin" es contexto de plataforma, no tenant.
  if (
    subdomain &&
    subdomain !== 'www' &&
    subdomain !== 'localhost' &&
    subdomain !== 'admin'
  ) {
    return { 'x-tenant-slug': subdomain };
  }

  return {};
}

/**
 * Wrapper de fetch que automáticamente incluye headers de tenant
 * @param input - URL o Request object
 * @param init - Opciones de fetch (opcional)
 */
export async function tenantFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const tenantHeaders = getTenantHeaders();

  const mergedInit: RequestInit = {
    ...init,
    headers: {
      ...tenantHeaders,
      ...init?.headers,
    },
  };

  return fetch(input, mergedInit);
}
