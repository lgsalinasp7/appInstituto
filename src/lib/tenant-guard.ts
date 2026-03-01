/**
 * Guard para asegurar que un tenantId está presente.
 * Uso: assertTenantContext(tenantId) — lanza error si es null/undefined.
 */

export function assertTenantContext(
  tenantId: string | null | undefined
): asserts tenantId is string {
  if (!tenantId) {
    throw new Error(
      'Contexto de tenant requerido. El tenantId no puede ser null o undefined.'
    );
  }
}
