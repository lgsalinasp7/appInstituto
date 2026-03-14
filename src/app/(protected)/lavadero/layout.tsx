/**
 * Lavadero Pro Layout
 * Valida que el usuario esté en un tenant y tenga platformRole LAVADERO_*
 * NO verifica slug fijo (a diferencia de Academia)
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LAVADERO_ROLES = ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"] as const;

export default async function LavaderoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) {
    redirect("/dashboard");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, tenantId: true },
  });

  const platformRole = userWithRole?.platformRole;
  if (!platformRole || !LAVADERO_ROLES.includes(platformRole as (typeof LAVADERO_ROLES)[number])) {
    redirect("/dashboard");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant || userWithRole.tenantId !== tenant.id) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
