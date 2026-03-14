import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { courseService } from "@/modules/academy/services/academy.service";
import { StudentDashboardClient } from "@/modules/academia/components/student/StudentDashboardClient";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      tenantId: true,
      academyEnrollments: {
        where: { status: "ACTIVE" },
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: "asc" },
                select: { id: true, title: true, order: true },
              },
            },
          },
          cohort: { select: { id: true, name: true } },
        },
        take: 1,
      },
    },
  });

  const enrollment = dbUser?.academyEnrollments[0];
  if (!enrollment) {
    return (
      <div className="academy-card-dark p-8 rounded-2xl">
        <h1 className="text-xl font-bold text-white mb-2">Sin matrícula activa</h1>
        <p className="text-slate-400">No tienes un curso activo en la academia.</p>
      </div>
    );
  }

  const tenantId = dbUser.tenantId ?? "";
  const course = await courseService.getBootcampCourse(tenantId);
  const snapshot = await prisma.academyStudentSnapshot.findFirst({
    where: { userId: user.id },
  });

  const completedLessonIds = await prisma.academyStudentProgress
    .findMany({
      where: {
        userId: user.id,
        completed: true,
        lesson: {
          module: { courseId: enrollment.courseId },
        },
      },
      select: { lessonId: true },
    })
    .then((r) => r.map((x) => x.lessonId));

  const nextLessons = course
    ? await prisma.academyLesson.findMany({
        where: {
          isActive: true,
          id: { notIn: completedLessonIds },
          module: { courseId: course.id },
        },
        include: {
          meta: { select: { weekNumber: true, dayOfWeek: true, sessionType: true } },
          module: { select: { title: true, order: true } },
        },
        orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
        take: 3,
      })
    : [];

  const badges = await prisma.academyBadgeEarned.findMany({
    where: { userId: user.id },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
    take: 3,
  });

  const cralCompleted = (snapshot?.cralCompleted as Record<string, number>) ?? {};
  const modules = course?.modules ?? [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length ?? 12), 0) || 48;

  const moduleProgress = modules.map((m, i) => {
    const lessonIds = m.lessons?.map((l) => l.id) ?? [];
    const completed = lessonIds.filter((id) => completedLessonIds.includes(id)).length;
    const total = lessonIds.length || 12;
    const pct = total > 0 ? (completed / total) * 100 : 0;
    return {
      id: m.id,
      title: m.title,
      order: m.order ?? i + 1,
      progress: pct,
    };
  });

  return (
    <StudentDashboardClient
      userName={dbUser?.name ?? "Estudiante"}
      progress={Number(snapshot?.overallProgress ?? 0)}
      lessonsCompleted={snapshot?.lessonsCompleted ?? completedLessonIds.length}
      lessonsTotal={snapshot?.lessonsTotal ?? totalLessons}
      quizzesPassed={snapshot?.quizzesPassed ?? 0}
      deliverablesApproved={snapshot?.deliverablesApproved ?? 0}
      kaledInteractions={snapshot?.kaledInteractions ?? 0}
      cralCompleted={cralCompleted}
      modules={moduleProgress}
      nextLessons={nextLessons.map((l) => ({
        id: l.id,
        title: l.title,
        weekNumber: l.meta?.weekNumber ?? 1,
        dayOfWeek: (l.meta?.dayOfWeek as string) ?? "LUNES",
        sessionType: (l.meta?.sessionType as string) ?? "TEORIA",
        moduleOrder: l.module.order ?? 1,
        moduleTitle: l.module.title ?? "",
      }))}
      badges={badges.map((b) => ({
        name: b.badge.name,
        icon: b.badge.icon ?? "🏅",
        earnedAt: b.earnedAt.toISOString(),
      }))}
      cohortName={enrollment.cohort?.name ?? "Cohorte"}
      courseId={enrollment.courseId}
    />
  );
}
