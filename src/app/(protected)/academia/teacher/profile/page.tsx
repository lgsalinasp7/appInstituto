import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeacherProfileView } from "@/modules/academia/components/teacher/TeacherProfileView";

export default async function TeacherProfilePage() {
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

  if (dbUser?.platformRole !== "ACADEMY_TEACHER" && dbUser?.platformRole !== "ACADEMY_ADMIN") {
    redirect("/academia");
  }

  const tenantId = dbUser?.tenantId;
  const cohort = tenantId
    ? await prisma.academyCohort.findFirst({
        where: { status: "ACTIVE", tenantId },
        select: { name: true },
      })
    : null;

  const [coursesCount, cohortsCount, studentsCount] = tenantId
    ? await Promise.all([
        prisma.academyCourse.count({ where: { tenantId } }),
        prisma.academyCohort.count({ where: { tenantId } }),
        prisma.academyEnrollment.count({
          where: {
            cohort: { tenantId },
            status: "ACTIVE",
          },
        }),
      ])
    : [0, 0, 0];

  const profileData = {
    userName: dbUser?.name ?? "Instructor",
    userEmail: dbUser?.email ?? "",
    userImage: dbUser?.image ?? undefined,
    cohortName: cohort?.name,
    coursesCount,
    cohortsCount,
    studentsCount,
  };

  return <TeacherProfileView data={profileData} />;
}
