import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentDashboardClient } from "@/modules/academia/components/student/StudentDashboardClient";
import { logTrialActivity, TRIAL_ACTIONS } from "@/lib/trial-activity";
import { getStudentErrorSummary } from "@/lib/academia/kaled-error-memory";

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
          course: { select: { durationWeeks: true } },
          cohort: { select: { id: true, name: true, status: true, schedule: true, startDate: true, endDate: true } },
        },
        take: 1,
      },
    },
  });

  type EnrollmentWithTrial = NonNullable<typeof dbUser>["academyEnrollments"][number] & {
    isTrial?: boolean;
  };
  const enrollment = dbUser?.academyEnrollments[0] as EnrollmentWithTrial | undefined;
  if (!enrollment || !dbUser) {
    return (
      <div className="academy-card-dark p-8 rounded-2xl">
        <h1 className="text-xl font-bold text-white mb-2">Sin matrícula activa</h1>
        <p className="text-slate-400">No tienes un curso activo en la academia.</p>
      </div>
    );
  }

  const tenantId = dbUser.tenantId ?? "";
  if (enrollment?.isTrial && tenantId) {
    logTrialActivity(dbUser.id, tenantId, TRIAL_ACTIONS.DASHBOARD_VIEW, "dashboard").catch(() => {});
  }

  const modulesWithLessons = await prisma.academyModule.findMany({
    where: { courseId: enrollment.courseId, isActive: true },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true },
      },
    },
  });

  const snapshot = await prisma.academyStudentSnapshot.findFirst({
    where: { userId: user.id, enrollmentId: enrollment.id },
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

  const nextLessons = await prisma.academyLesson.findMany({
    where: {
      isActive: true,
      id: { notIn: completedLessonIds },
      module: { courseId: enrollment.courseId },
    },
    include: {
      meta: { select: { weekNumber: true, dayOfWeek: true, sessionType: true, phaseTarget: true } },
      module: { select: { title: true, order: true } },
    },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    take: 3,
  });

  const lastCompletedLesson = await prisma.academyLesson.findFirst({
    where: {
      id: { in: completedLessonIds },
      module: { courseId: enrollment.courseId },
    },
    include: {
      module: { select: { order: true, title: true } },
      meta: { select: { weekNumber: true, dayOfWeek: true, sessionType: true, phaseTarget: true } },
    },
    orderBy: [{ module: { order: "desc" } }, { order: "desc" }],
  });

  const badges = await prisma.academyBadgeEarned.findMany({
    where: { userId: user.id },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
    take: 3,
  });

  const cralCompleted = (snapshot?.cralCompleted as Record<string, number>) ?? {};
  const modules = modulesWithLessons;
  const errorSummary = tenantId
    ? await getStudentErrorSummary(user.id, tenantId)
    : "";
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) || 48;
  const totalBootcampWeeks = enrollment.course.durationWeeks ?? 16;

  const cohortSchedule = (enrollment.cohort?.schedule ?? {}) as {
    days?: string[];
    time?: string;
  };
  const dayMap: Record<string, string> = {
    LUNES: "Lun",
    MARTES: "Mar",
    MIERCOLES: "Mié",
    JUEVES: "Jue",
    VIERNES: "Vie",
    SABADO: "Sáb",
    DOMINGO: "Dom",
  };
  const scheduleDays = (cohortSchedule.days ?? []).map((d) => dayMap[d] ?? d).join("/");
  const cohortScheduleLabel = scheduleDays && cohortSchedule.time
    ? `${scheduleDays} ${cohortSchedule.time} COT`
    : "";

  const now = new Date();
  const cohortStart = enrollment.cohort?.startDate;
  const cohortEnd = enrollment.cohort?.endDate;
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  let academicWeekCurrent = 1;
  if (cohortStart) {
    const elapsedWeeks = Math.floor((now.getTime() - cohortStart.getTime()) / MS_PER_WEEK) + 1;
    academicWeekCurrent = Math.max(1, Math.min(totalBootcampWeeks, elapsedWeeks));
  }
  if (cohortEnd && now > cohortEnd) {
    academicWeekCurrent = totalBootcampWeeks;
  }

  const deliverablesPending = await prisma.academyDeliverableSubmission.count({
    where: {
      userId: user.id,
      status: { in: ["PENDIENTE", "ENTREGADO", "EN_REVISION"] },
    },
  });

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
        lessonOrder: l.order ?? 1,
        weekNumber: l.meta?.weekNumber ?? 1,
        dayOfWeek: (l.meta?.dayOfWeek as string) ?? "LUNES",
        sessionType: (l.meta?.sessionType as string) ?? "TEORIA",
        moduleOrder: l.module.order ?? 1,
        moduleTitle: l.module.title ?? "",
      }))}
      resumeLesson={
        nextLessons[0]
          ? {
              id: nextLessons[0].id,
              title: nextLessons[0].title,
              lessonOrder: nextLessons[0].order ?? 1,
              moduleOrder: nextLessons[0].module.order ?? 1,
            }
          : lastCompletedLesson
            ? {
                id: lastCompletedLesson.id,
                title: lastCompletedLesson.title,
                lessonOrder: lastCompletedLesson.order ?? 1,
                moduleOrder: lastCompletedLesson.module.order ?? 1,
              }
            : null
      }
      badges={badges.map((b) => ({
        name: b.badge.name,
        icon: b.badge.icon ?? "🏅",
        earnedAt: b.earnedAt.toISOString(),
      }))}
      cohortName={enrollment.cohort?.name ?? "Cohorte"}
      cohortStatus={enrollment.cohort?.status ?? "ACTIVE"}
      cohortScheduleLabel={cohortScheduleLabel}
      courseId={enrollment.courseId}
      totalBootcampWeeks={totalBootcampWeeks}
      academicWeekCurrent={academicWeekCurrent}
      deliverablesPending={deliverablesPending}
      errorSummary={errorSummary}
      nextLessonPhase={nextLessons[0]?.meta?.phaseTarget as string | undefined}
    />
  );
}
