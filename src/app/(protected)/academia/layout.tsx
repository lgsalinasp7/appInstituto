/**
 * Academia Layout
 * Valida que el usuario esté en tenant kaledacademy y tenga platformRole ACADEMY_*
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ACADEMY_ROLES = ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"] as const;

export default async function AcademiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (tenantSlug !== "kaledacademy") {
    redirect("/dashboard");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, tenantId: true },
  });

  const platformRole = userWithRole?.platformRole;
  if (!platformRole || !ACADEMY_ROLES.includes(platformRole as (typeof ACADEMY_ROLES)[number])) {
    redirect("/dashboard");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });
  if (!tenant || userWithRole.tenantId !== tenant.id) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
