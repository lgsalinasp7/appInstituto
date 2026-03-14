import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminCalendarAndCohortsView } from "@/modules/academia/components/admin/AdminCalendarAndCohortsView";

export default async function AcademiaAdminCalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });
  const tenantId = dbUser?.tenantId ?? "";

  const cohorts = await prisma.academyCohort.findMany({
    where: { tenantId },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { startDate: "desc" },
  });

  const events = cohorts.map((c) => ({
    id: c.id,
    name: c.name,
    courseId: c.courseId,
    courseTitle: c.course.title,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    status: c.status,
  }));

  return <AdminCalendarAndCohortsView events={events} />;
}
