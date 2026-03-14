/**
 * Configuración de rutas y permisos por platformRole de Lavadero Pro
 */
import type { PlatformRole } from "@prisma/client";

export const LAVADERO_ROLES = [
  "LAVADERO_ADMIN",
  "LAVADERO_SUPERVISOR",
] as const;

export type LavaderoRole = (typeof LAVADERO_ROLES)[number];

export function isLavaderoRole(role: string | null): role is LavaderoRole {
  return role !== null && LAVADERO_ROLES.includes(role as LavaderoRole);
}

export const LAVADERO_ROUTES = {
  admin: [
    { path: "/lavadero/admin/dashboard", label: "Dashboard" },
    { path: "/lavadero/admin/orders", label: "Órdenes" },
    { path: "/lavadero/admin/customers", label: "Clientes" },
    { path: "/lavadero/admin/services", label: "Servicios" },
    { path: "/lavadero/admin/billing", label: "Facturación" },
  ],
  supervisor: [
    { path: "/lavadero/supervisor/dashboard", label: "Dashboard" },
    { path: "/lavadero/supervisor/orders", label: "Órdenes" },
  ],
} as const;

export function getLavaderoRoutesForRole(role: PlatformRole | null) {
  if (!role) return [];
  switch (role) {
    case "LAVADERO_ADMIN":
      return [...LAVADERO_ROUTES.admin];
    case "LAVADERO_SUPERVISOR":
      return [...LAVADERO_ROUTES.supervisor];
    default:
      return [];
  }
}
