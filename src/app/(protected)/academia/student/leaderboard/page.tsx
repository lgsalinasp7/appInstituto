import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cohortService } from "@/modules/academia/services/academy.service";
import { LeaderboardView } from "@/modules/academia/components/student/LeaderboardView";

export default async function AcademiaStudentLeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });

  const enrollment = await prisma.academyEnrollment.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    select: { cohortId: true },
  });

  const cohortId = enrollment?.cohortId ?? null;

  if (!cohortId) {
    return <LeaderboardView cohortId={null} currentUserId={user.id} entries={[]} />;
  }

  const tenantId = dbUser?.tenantId ?? "";
  const ranking = await cohortService.getStudentRanking(cohortId, tenantId);

  const entries = (Array.isArray(ranking) ? ranking : []).map((r) => ({
    userId: r.student.id,
    name: r.student.name ?? "Estudiante",
    image: r.student.image ?? null,
    points: r.lessonsCompleted ?? 0,
    rank: r.rank,
  }));

  return (
    <LeaderboardView
      cohortId={cohortId}
      currentUserId={user.id}
      entries={entries}
    />
  );
}
