import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cohortService } from "@/modules/academy/services/academy.service";
import { LeaderboardView } from "@/modules/academia/components/student/LeaderboardView";

export default async function AcademiaTeacherLeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });
  const tenantId = dbUser?.tenantId ?? "";

  const cohort = tenantId
    ? await prisma.academyCohort.findFirst({
        where: { tenantId, status: "ACTIVE" },
        select: { id: true },
      })
    : null;

  const cohortId = cohort?.id ?? null;

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
