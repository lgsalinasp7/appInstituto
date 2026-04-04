import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Cohortes
  const cohorts = await prisma.academyCohort.findMany({
    include: {
      course: { select: { title: true } },
      _count: { select: { events: true, enrollments: true } },
    },
    orderBy: { startDate: "desc" },
  });

  console.log("=== COHORTES ===");
  console.log("Total:", cohorts.length);
  for (const c of cohorts) {
    console.log(`  ${c.name} | curso: ${c.course.title} | status: ${c.status} | kind: ${c.kind} | eventos: ${c._count.events} | enrollments: ${c._count.enrollments} | ${c.startDate.toISOString().slice(0, 10)} → ${c.endDate.toISOString().slice(0, 10)}`);
  }

  // Eventos
  const events = await prisma.academyCohortEvent.findMany({
    include: {
      cohort: { select: { name: true } },
      lesson: { select: { title: true } },
    },
    orderBy: [{ cohortId: "asc" }, { sessionOrder: "asc" }],
  });

  console.log("\n=== EVENTOS ===");
  console.log("Total:", events.length);
  if (events.length > 0) {
    console.log("Con lessonId:", events.filter((e) => e.lessonId).length);
    console.log("Sin lessonId:", events.filter((e) => !e.lessonId).length);
    console.log("Con scheduledAt:", events.filter((e) => e.scheduledAt).length);
    console.log("Recurrentes (dayOfWeek sin scheduledAt):", events.filter((e) => e.dayOfWeek !== null && !e.scheduledAt).length);

    for (const e of events) {
      const lesson = e.lessonId ? (e.lesson?.title?.substring(0, 30) ?? "?") : "(ninguna)";
      const sched = e.scheduledAt ? e.scheduledAt.toISOString().slice(0, 16) : "(null)";
      console.log(`  #${e.sessionOrder} | ${e.title.substring(0, 35).padEnd(35)} | lesson: ${lesson} | sched: ${sched} | cancel: ${e.cancelled}`);
    }
  } else {
    console.log("No hay eventos. Necesitas crear eventos desde la UI de admin.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
