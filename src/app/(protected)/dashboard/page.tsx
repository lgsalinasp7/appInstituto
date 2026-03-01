import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnrollmentDashboard } from "@/modules/dashboard/components/EnrollmentDashboard";

export const dynamic = "force-dynamic";

const ACADEMY_ROLES = ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"] as const;

export default async function DashboardPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (tenantSlug === "kaledacademy") {
    const user = await getCurrentUser();
    if (user) {
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        select: { platformRole: true, tenantId: true },
      });
      const platformRole = userWithRole?.platformRole;
      if (
        platformRole &&
        ACADEMY_ROLES.includes(platformRole as (typeof ACADEMY_ROLES)[number])
      ) {
        redirect("/academia");
      }
    }
  }

  return <EnrollmentDashboard />;
}
