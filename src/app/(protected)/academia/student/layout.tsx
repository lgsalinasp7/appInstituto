import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/modules/academia/components/student/StudentSidebar";
import { StudentTopbar } from "@/modules/academia/components/student/StudentTopbar";
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
    <div className="academy-shell-dark w-full h-screen flex font-sans relative overflow-hidden">
      <StudentSidebar
        userName={dbUser.name ?? "Estudiante"}
        userEmail={dbUser.email ?? ""}
        userImage={dbUser.image ?? undefined}
        progress={progress}
        lessonsCompleted={snapshot?.lessonsCompleted ?? 0}
        lessonsTotal={snapshot?.lessonsTotal ?? 48}
        cohortName={enrollment?.cohort?.name ?? "Cohorte"}
      />

      <div className="w-full flex flex-col min-w-0 min-h-0 lg:pl-[260px]">
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
