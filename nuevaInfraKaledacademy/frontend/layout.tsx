/**
 * app/academia/student/layout.tsx
 * Shell de la Academia para ACADEMY_STUDENT
 * Usa el design system existente: academy-shell-dark, academy-card-dark, etc.
 * Stack: Next.js 16, Tailwind 4, Lucide, Framer Motion
 * Auth: getCurrentUser() de @/lib/auth (NO Clerk)
 */

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { StudentSidebar } from "@/modules/academia/components/student/StudentSidebar";
import { StudentTopbar } from "@/modules/academia/components/student/StudentTopbar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");
  if (tenantSlug !== "kaledacademy") redirect("/dashboard");

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
      academyEnrollments: {
        where: { status: "ACTIVE" },
        include: {
          course: { select: { id: true, title: true } },
          cohort: { select: { id: true, name: true } },
        },
        take: 1,
      },
    },
  });

  if (dbUser?.platformRole !== "ACADEMY_STUDENT") redirect("/academia");

  const enrollment = dbUser.academyEnrollments[0];

  // Progreso global
  const snapshot = await prisma.academyStudentSnapshot.findFirst({
    where: { userId: user.id },
    select: {
      overallProgress: true,
      lessonsCompleted: true,
      lessonsTotal: true,
    },
  });

  const progress = Number(snapshot?.overallProgress ?? 0);

  return (
    <div className="academy-shell-dark min-h-screen flex">
      {/* Sidebar */}
      <StudentSidebar
        userName={dbUser.name ?? "Estudiante"}
        userEmail={dbUser.email}
        userImage={dbUser.image ?? undefined}
        progress={progress}
        lessonsCompleted={snapshot?.lessonsCompleted ?? 0}
        lessonsTotal={snapshot?.lessonsTotal ?? 48}
        cohortName={enrollment?.cohort?.name ?? "Cohorte 2025-1"}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <StudentTopbar
          userName={dbUser.name ?? "Estudiante"}
          userImage={dbUser.image ?? undefined}
          cohortName={enrollment?.cohort?.name ?? "Cohorte 2025-1"}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
