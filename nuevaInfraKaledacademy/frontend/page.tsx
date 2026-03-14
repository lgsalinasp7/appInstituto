/**
 * app/academia/student/page.tsx  →  StudentDashboard
 * modules/academia/components/student/StudentDashboard.tsx
 *
 * Vista principal del estudiante:
 * - Hero con progreso CRAL
 * - Módulos del bootcamp
 * - Métricas rápidas
 * - Widget Kaled AI
 * - Próximas sesiones
 *
 * Server Component — datos de Prisma directamente
 */

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StudentDashboardClient } from "@/modules/academia/components/student/StudentDashboardClient";

// ── Page (Server Component) ──────────────────────────────
export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [dbUser, snapshot] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
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
    }),
    prisma.academyStudentSnapshot.findFirst({
      where: { userId: user.id },
    }),
  ]);

  const enrollment = dbUser?.academyEnrollments[0];

  // Próximas sesiones sin completar
  const nextLessons = await prisma.academyLesson.findMany({
    where: {
      isActive: true,
      module: {
        course: {
          enrollments: { some: { userId: user.id, status: "ACTIVE" } },
        },
      },
      progress: { none: { userId: user.id, completed: true } },
    },
    include: {
      meta: { select: { weekNumber: true, dayOfWeek: true, sessionType: true } },
      module: { select: { title: true, order: true } },
    },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    take: 3,
  });

  // Badges recientes
  const badges = await prisma.academyBadgeEarned.findMany({
    where: { userId: user.id },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
    take: 3,
  });

  return (
    <StudentDashboardClient
      userName={dbUser?.name ?? "Estudiante"}
      progress={Number(snapshot?.overallProgress ?? 0)}
      lessonsCompleted={snapshot?.lessonsCompleted ?? 0}
      lessonsTotal={snapshot?.lessonsTotal ?? 48}
      quizzesPassed={snapshot?.quizzesPassed ?? 0}
      deliverablesApproved={snapshot?.deliverablesApproved ?? 0}
      kaledInteractions={snapshot?.kaledInteractions ?? 0}
      cralCompleted={(snapshot?.cralCompleted as Record<string, number>) ?? {}}
      modules={
        enrollment?.course.modules.map((m, i) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          // progreso aproximado por módulo
          progress:
            i + 1 < Math.ceil((Number(snapshot?.overallProgress ?? 0) / 100) * 4)
              ? 100
              : i + 1 === Math.ceil((Number(snapshot?.overallProgress ?? 0) / 100) * 4)
              ? (Number(snapshot?.overallProgress ?? 0) % 25) * 4
              : 0,
        })) ?? []
      }
      nextLessons={nextLessons.map((l) => ({
        id: l.id,
        title: l.title,
        weekNumber: l.meta?.weekNumber ?? 1,
        dayOfWeek: (l.meta?.dayOfWeek as string) ?? "LUNES",
        sessionType: (l.meta?.sessionType as string) ?? "TEORIA",
        moduleOrder: l.module.order,
        moduleTitle: l.module.title,
      }))}
      badges={badges.map((b) => ({
        name: b.badge.name,
        icon: b.badge.icon,
        earnedAt: b.earnedAt.toISOString(),
      }))}
      cohortName={enrollment?.cohort?.name ?? "Cohorte 2025-1"}
    />
  );
}
