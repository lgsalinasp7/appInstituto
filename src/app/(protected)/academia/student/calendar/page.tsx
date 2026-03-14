import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/modules/academia/components/student/CalendarView";

export default async function AcademiaStudentCalendarPage() {
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

  return <CalendarView events={events} />;
}
