import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AcademiaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true },
  });
  const role = userWithRole?.platformRole;

  if (role === "ACADEMY_STUDENT") redirect("/academia/student");
  if (role === "ACADEMY_TEACHER") redirect("/academia/teacher");
  if (role === "ACADEMY_ADMIN") redirect("/academia/admin");

  redirect("/dashboard");
}
