import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminProfileView } from "@/modules/academia/components/admin/AdminProfileView";

const ACADEMY_ROLES = ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"] as const;

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      platformRole: true,
      tenantId: true,
    },
  });

  if (dbUser?.platformRole !== "ACADEMY_ADMIN") redirect("/academia");

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });
  const tenantId = dbUser.tenantId ?? tenant?.id;

  const [coursesCount, cohortsCount, usersCount] =
    tenantId != null
      ? await Promise.all([
          prisma.academyCourse.count({ where: { tenantId } }),
          prisma.academyCohort.count({ where: { tenantId } }),
          prisma.user.count({
            where: {
              tenantId,
              platformRole: { in: [...ACADEMY_ROLES] },
            },
          }),
        ])
      : [0, 0, 0];

  const profileData = {
    userName: dbUser.name ?? "Administrador",
    userEmail: dbUser.email ?? "",
    userImage: dbUser.image ?? undefined,
    coursesCount,
    cohortsCount,
    usersCount,
  };

  return <AdminProfileView data={profileData} />;
}
