import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { AcademyCohortService } from "@/modules/academia";
import { CohortView } from "@/modules/academia/components/student/CohortView";

interface PageProps {
  params: Promise<{ cohortId: string }>;
}

export default async function StudentCohortPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, tenantId: true },
  });

  const { cohortId } = await params;
  if (!dbUser?.tenantId) notFound();

  const data = await AcademyCohortService.getCohortDataForStudent(
    user.id,
    cohortId,
    dbUser.platformRole ?? "ACADEMY_STUDENT",
    dbUser.tenantId
  );

  if (!data) notFound();

  return <CohortView data={data} />;
}
