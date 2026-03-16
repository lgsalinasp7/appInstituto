import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileView, type ProfileData, type ProfileModule } from "@/modules/academia/components/student/ProfileView";

function getLevel(progress: number) {
  if (progress >= 90) return "Elite Builder";
  if (progress >= 70) return "Senior Builder";
  if (progress >= 50) return "Builder";
  if (progress >= 25) return "Junior Builder";
  return "Trainee";
}

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const enrollment = await prisma.academyEnrollment.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      course: {
        include: {
          modules: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
              lessons: {
                where: { isActive: true },
                select: {
                  id: true,
                  meta: { select: { weekNumber: true, phaseTarget: true, concepts: true } },
                },
              },
            },
          },
        },
      },
      cohort: { select: { id: true, name: true, startDate: true } },
    },
  });

  const snapshot = await prisma.academyStudentSnapshot.findFirst({
    where: { userId: user.id },
    select: {
      overallProgress: true,
      lessonsCompleted: true,
      lessonsTotal: true,
      quizzesPassed: true,
      totalTimeSpentSec: true,
      kaledInteractions: true,
    },
  });

  const completedLessonIds = await prisma.academyStudentProgress.findMany({
    where: { userId: user.id, completed: true },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedLessonIds.map((p) => p.lessonId));

  const badges = await prisma.academyBadgeEarned.findMany({
    where: { userId: user.id },
    include: {
      badge: { select: { id: true, name: true, description: true, icon: true, condition: true } },
    },
    orderBy: { earnedAt: "desc" },
  });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, image: true },
  });

  const overallProgress = Number(snapshot?.overallProgress ?? 0);
  const rawModules = enrollment?.course?.modules ?? [];
  // Deduplicar por id y por order (evita módulos repetidos en la vista)
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();
  const modules = rawModules.filter((mod) => {
    if (seenIds.has(mod.id)) return false;
    if (seenOrders.has(mod.order)) return false;
    seenIds.add(mod.id);
    seenOrders.add(mod.order);
    return true;
  }).sort((a, b) => a.order - b.order);
  const cohortStart = enrollment?.cohort?.startDate;

  const profileModules: ProfileModule[] = modules.map((mod) => {
    const lessonIds = mod.lessons.map((l) => l.id);
    const lessonsCompleted = lessonIds.filter((id) => completedSet.has(id)).length;
    const lessonsTotal = lessonIds.length;
    const allDone = lessonsTotal > 0 && lessonsCompleted === lessonsTotal;

    const firstMeta = mod.lessons[0]?.meta;
    const weekNumber = firstMeta?.weekNumber ?? mod.order;
    const phase = firstMeta?.phaseTarget ?? null;

    const tags: string[] = [];
    if (allDone && firstMeta?.concepts) {
      const concepts = firstMeta.concepts as string[];
      if (Array.isArray(concepts)) {
        tags.push(...concepts.slice(0, 3));
      }
    }

    let startDate: string | null = null;
    let endDate: string | null = null;
    if (cohortStart) {
      const start = new Date(cohortStart);
      start.setDate(start.getDate() + (weekNumber - 1) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      startDate = start.toISOString();
      endDate = end.toISOString();
    }

    let status: ProfileModule["status"];
    if (allDone) {
      status = "completed";
    } else if (lessonsCompleted > 0) {
      status = "active";
    } else {
      const prevModule = modules.find((m) => m.order === mod.order - 1);
      if (!prevModule) {
        status = "active";
      } else {
        const prevLessonIds = prevModule.lessons.map((l) => l.id);
        const prevAllDone = prevLessonIds.length > 0 && prevLessonIds.every((id) => completedSet.has(id));
        status = prevAllDone ? "upcoming" : "locked";
      }
    }

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      order: mod.order,
      weekNumber,
      startDate,
      endDate,
      status,
      phase,
      tags,
      lessonsCompleted,
      lessonsTotal,
    };
  });

  const currentModule = profileModules.find((m) => m.status === "active") ?? profileModules[0];

  const profileData: ProfileData = {
    userName: dbUser?.name ?? "Estudiante",
    userEmail: dbUser?.email ?? undefined,
    userImage: dbUser?.image ?? undefined,
    level: getLevel(overallProgress),
    cohortName: enrollment?.cohort?.name ?? "Sin cohorte",
    overallProgress,
    currentModuleOrder: currentModule?.order ?? 1,
    totalModules: profileModules.length,
    lessonsCompleted: snapshot?.lessonsCompleted ?? 0,
    lessonsTotal: snapshot?.lessonsTotal ?? 0,
    totalTimeSpentHours: (snapshot?.totalTimeSpentSec ?? 0) / 3600,
    kaledInteractions: snapshot?.kaledInteractions ?? 0,
    quizzesPassed: snapshot?.quizzesPassed ?? 0,
    modules: profileModules,
    badges: badges.map((b) => ({
      id: b.badge.id,
      name: b.badge.name,
      description: b.badge.description,
      icon: b.badge.condition,
      earnedAt: b.earnedAt.toISOString(),
    })),
  };

  return <ProfileView data={profileData} />;
}
