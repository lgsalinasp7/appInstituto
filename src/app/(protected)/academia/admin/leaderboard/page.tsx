import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cohortService } from "@/modules/academy/services/academy.service";
import { LeaderboardView } from "@/modules/academia/components/student/LeaderboardView";

interface PageProps {
  searchParams?: Promise<{ cohortId?: string }>;
}

export default async function AcademiaAdminLeaderboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });
  const tenantId = dbUser?.tenantId ?? "";
  const sp = searchParams ? await searchParams : {};
  const requestedId = typeof sp.cohortId === "string" && sp.cohortId.length > 0 ? sp.cohortId : null;

  let cohortId: string | null = null;
  if (tenantId && requestedId) {
    const match = await prisma.academyCohort.findFirst({
      where: { id: requestedId, tenantId },
      select: { id: true },
    });
    cohortId = match?.id ?? null;
  }
  if (!cohortId && tenantId) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { tenantId, status: "ACTIVE" },
      select: { id: true },
    });
    cohortId = cohort?.id ?? null;
  }

  let entries: { userId: string; name: string; image: string | null; points: number; rank: number }[] = [];

  if (cohortId) {
    const ranking = await cohortService.getStudentRanking(cohortId, tenantId);
    entries = (Array.isArray(ranking) ? ranking : []).map((r) => ({
      userId: r.student.id,
      name: r.student.name ?? "Estudiante",
      image: r.student.image ?? null,
      points: r.lessonsCompleted ?? 0,
      rank: r.rank,
    }));
  }

  return (
    <LeaderboardView cohortId={cohortId} currentUserId={user.id} entries={entries} />
  );
}
