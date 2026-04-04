import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AcademyCohortService } from "@/modules/academia";
import { CalendarView } from "@/modules/academia/components/student/CalendarView";

export default async function AcademiaStudentCalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });
  const tenantId = dbUser?.tenantId ?? "";

  const { events, releasedByCohort } =
    await AcademyCohortService.listEventsForStudentCalendar(user.id, tenantId);

  return <CalendarView events={events} releasedByCohort={releasedByCohort} />;
}
