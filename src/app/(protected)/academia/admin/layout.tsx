import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AcademyAdminSidebar } from "@/modules/academia/components/admin/AcademyAdminSidebar";

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
    <div className="academy-shell-dark min-h-screen flex">
      <AcademyAdminSidebar
        userName={dbUser.name ?? "Admin"}
        userEmail={dbUser.email ?? ""}
        userImage={dbUser.image ?? undefined}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="academy-topbar-dark sticky top-0 z-40 h-14 flex items-center px-4 lg:px-6">
          <h1 className="text-lg font-bold text-white">Panel de Administración</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
