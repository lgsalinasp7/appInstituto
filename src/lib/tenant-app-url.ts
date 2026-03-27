/**
 * URL absoluta del panel del tenant (evita bucles con proxy del host admin).
 */
export function getTenantDashboardAbsoluteUrl(tenantSlug: string): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  if (process.env.NODE_ENV === "development") {
    return `http://${tenantSlug}.localhost:3000/dashboard`;
  }
  return `https://${tenantSlug}.${root}/dashboard`;
}
