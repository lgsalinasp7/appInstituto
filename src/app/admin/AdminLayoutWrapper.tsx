/**
 * AdminLayoutWrapper - Server Component
 * Valida que el usuario autenticado tenga platformRole
 * antes de renderizar el panel de administración
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantDashboardAbsoluteUrl } from "@/lib/tenant-app-url";
import AdminLayoutClient from "./AdminLayoutClient";

const PLATFORM_ADMIN_ROLES = new Set([
  "SUPER_ADMIN",
  "ASESOR_COMERCIAL",
  "MARKETING",
]);

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Usuario de un instituto: no puede usar el panel admin en este host.
  // Importante: NO usar redirect("/dashboard") aquí — en admin.* el proxy
  // redirige /dashboard → /admin y provoca bucle infinito.
  if (user.tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { slug: true },
    });
    if (tenant?.slug) {
      redirect(getTenantDashboardAbsoluteUrl(tenant.slug));
    }
    redirect("/login");
  }

  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, name: true, email: true },
  });

  const pr = userWithRole?.platformRole;
  if (!pr || !PLATFORM_ADMIN_ROLES.has(pr)) {
    redirect("/login");
  }

  return (
    <AdminLayoutClient
      platformRole={userWithRole.platformRole!}
      userName={userWithRole.name || userWithRole.email}
    >
      {children}
    </AdminLayoutClient>
  );
}
