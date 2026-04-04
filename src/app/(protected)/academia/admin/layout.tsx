import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AcademyAdminSidebar } from "@/modules/academia/components/admin/AcademyAdminSidebar";
import { AcademyAdminTopbar } from "@/modules/academia/components/admin/AcademyAdminTopbar";

export default async function AdminLayout({
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

  if (dbUser?.platformRole !== "ACADEMY_ADMIN") redirect("/academia");

  return (
    <div className="academy-shell-dark w-full h-screen flex font-sans relative overflow-hidden">
      <AcademyAdminSidebar />

      <div className="w-full flex flex-col min-w-0 min-h-0 lg:pl-[260px]">
        <AcademyAdminTopbar
          userName={dbUser.name ?? "Admin"}
          userImage={dbUser.image ?? undefined}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8 pb-28 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
