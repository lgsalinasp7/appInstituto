/**
 * Lavadero Pro - Redirect por rol
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LavaderoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true },
  });

  if (userWithRole?.platformRole === "LAVADERO_ADMIN") {
    redirect("/lavadero/admin");
  }
  if (userWithRole?.platformRole === "LAVADERO_SUPERVISOR") {
    redirect("/lavadero/supervisor");
  }

  redirect("/dashboard");
}
