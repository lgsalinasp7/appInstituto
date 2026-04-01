import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AcademyCohortLifecycleService } from "@/modules/academia/services/academy-cohort-lifecycle.service";
import { StudentSidebar } from "@/modules/academia/components/student/StudentSidebar";
import { StudentTopbar } from "@/modules/academia/components/student/StudentTopbar";
import { TrialBanner } from "@/modules/academia/components/student/TrialBanner";
import { MainContent } from "./MainContent";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    },
  });

  if (!dbUser || dbUser.platformRole !== "ACADEMY_STUDENT") redirect("/academia");

  const tenantIdRow = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });
  const tenantId = tenantIdRow?.tenantId;
  if (tenantId) {
    await AcademyCohortLifecycleService.applyPromotionalExpiryIfNeeded(
      user.id,
      tenantId
    );
  }

  const enrollment = await prisma.academyEnrollment.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      course: { select: { id: true, title: true } },
      cohort: { select: { id: true, name: true } },
    },
  });

  const snapshot =
    enrollment != null
      ? await prisma.academyStudentSnapshot.findFirst({
          where: { userId: user.id, enrollmentId: enrollment.id },
          select: {
            overallProgress: true,
            lessonsCompleted: true,
            lessonsTotal: true,
          },
        })
      : null;

  const progress = Number(snapshot?.overallProgress ?? 0);

  return (
    <div className="academy-shell-dark w-full h-screen flex font-sans relative overflow-hidden">
      <StudentSidebar
        progress={progress}
        lessonsCompleted={snapshot?.lessonsCompleted ?? 0}
        lessonsTotal={snapshot?.lessonsTotal ?? 48}
      />

      <div className="w-full flex flex-col min-w-0 min-h-0 lg:pl-[260px]">
        {enrollment?.isTrial && enrollment.trialExpiresAt && (
          <TrialBanner
            trialExpiresAt={enrollment.trialExpiresAt}
            nextCohortDate={null}
            isExpired={new Date() > enrollment.trialExpiresAt}
          />
        )}
        <StudentTopbar
          userName={dbUser.name ?? "Estudiante"}
          userImage={dbUser.image ?? undefined}
          cohortName={enrollment?.cohort?.name ?? "Cohorte"}
        />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
