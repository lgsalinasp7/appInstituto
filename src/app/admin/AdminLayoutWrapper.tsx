/**
 * AdminLayoutWrapper - Server Component
 * Valida que el usuario autenticado tenga platformRole
 * antes de renderizar el panel de administración
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validar sesión server-side
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar que sea usuario de plataforma (sin tenantId)
  if (user.tenantId) {
    redirect("/dashboard");
  }

  // Verificar platformRole
  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, name: true, email: true },
  });

  if (!userWithRole?.platformRole) {
    redirect("/dashboard");
  }

  return (
    <AdminLayoutClient
      platformRole={userWithRole.platformRole}
      userName={userWithRole.name || userWithRole.email}
    >
      {children}
    </AdminLayoutClient>
  );
}
