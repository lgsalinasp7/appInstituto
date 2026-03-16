import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/modules/academia/components/teacher/TeacherSidebar";
import { TeacherTopbar } from "@/modules/academia/components/teacher/TeacherTopbar";

export default async function TeacherLayout({
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

  if (dbUser?.platformRole !== "ACADEMY_TEACHER" && dbUser?.platformRole !== "ACADEMY_ADMIN") {
    redirect("/academia");
  }

  const tenantId = dbUser ? (await prisma.user.findUnique({ where: { id: user.id }, select: { tenantId: true } }))?.tenantId : null;
  const cohort = tenantId
    ? await prisma.academyCohort.findFirst({
        where: { status: "ACTIVE", tenantId },
        select: { name: true },
      })
    : null;

  return (
    <div className="academy-shell-dark w-full h-screen flex font-sans relative overflow-hidden">
      <TeacherSidebar
        userName={dbUser?.name ?? "Instructor"}
        userEmail={dbUser?.email ?? ""}
        userImage={dbUser?.image ?? undefined}
        cohortName={cohort?.name}
      />

      <div className="w-full flex flex-col min-w-0 min-h-0 lg:pl-[220px]">
        <TeacherTopbar
          userName={dbUser?.name ?? "Instructor"}
          userImage={dbUser?.image ?? undefined}
          cohortName={cohort?.name}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8 pb-28 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
