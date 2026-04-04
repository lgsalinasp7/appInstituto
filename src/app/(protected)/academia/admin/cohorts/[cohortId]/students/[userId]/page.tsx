import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CohortStudentAdminDetailView } from "@/modules/academia/components/admin/CohortStudentAdminDetailView";

interface PageProps {
  params: Promise<{ cohortId: string; userId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cohortId, userId } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "kaledacademy.kaledsoft.tech";
  const protocol = headersList.get("x-forwarded-proto") === "https" ? "https" : "http";
  const canonical = `${protocol}://${host}/academia/admin/cohorts/${cohortId}/students/${userId}`;
  return {
    title: "Ficha de estudiante | Academia",
    description: "Seguimiento y entregables del estudiante en el cohorte.",
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}

export default async function AdminCohortStudentDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, tenantId: true },
  });

  if (dbUser?.platformRole !== "ACADEMY_ADMIN") {
    redirect("/academia");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });
  const tenantId = dbUser.tenantId ?? tenant?.id;
  if (!tenantId) {
    redirect("/academia");
  }

  const { cohortId, userId: studentUserId } = await params;

  const cohort = await prisma.academyCohort.findFirst({
    where: { id: cohortId, tenantId },
    select: {
      id: true,
      name: true,
      courseId: true,
      course: { select: { title: true } },
    },
  });

  if (!cohort) {
    notFound();
  }

  const enrollment = await prisma.academyEnrollment.findFirst({
    where: {
      cohortId: cohort.id,
      userId: studentUserId,
      courseId: cohort.courseId,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!enrollment) {
    notFound();
  }

  const [snapshot, lessonsTotal, completedLessons, submissions] = await Promise.all([
    prisma.academyStudentSnapshot.findUnique({
      where: { enrollmentId: enrollment.id },
      select: {
        overallProgress: true,
        lessonsCompleted: true,
        lessonsTotal: true,
      },
    }),
    prisma.academyLesson.count({
      where: {
        isActive: true,
        module: { courseId: cohort.courseId, isActive: true },
      },
    }),
    prisma.academyStudentProgress.count({
      where: {
        userId: studentUserId,
        completed: true,
        lesson: {
          module: { courseId: cohort.courseId, isActive: true },
        },
      },
    }),
    prisma.academyDeliverableSubmission.findMany({
      where: {
        userId: studentUserId,
        deliverable: {
          lesson: { module: { courseId: cohort.courseId } },
        },
      },
      include: {
        deliverable: {
          select: {
            title: true,
            weekNumber: true,
            lesson: { select: { title: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const overallProgress = Number(snapshot?.overallProgress ?? enrollment.progress ?? 0);
  const snapLessonsCompleted = snapshot?.lessonsCompleted ?? completedLessons;
  const snapLessonsTotal = snapshot?.lessonsTotal && snapshot.lessonsTotal > 0 ? snapshot.lessonsTotal : lessonsTotal;

  const deliverables = submissions.map((s) => ({
    id: s.id,
    deliverableTitle: s.deliverable.title,
    lessonTitle: s.deliverable.lesson?.title ?? null,
    weekNumber: s.deliverable.weekNumber,
    status: s.status,
    githubUrl: s.githubUrl,
    deployUrl: s.deployUrl,
    submittedAt: s.submittedAt?.toISOString() ?? null,
    reviewedAt: s.reviewedAt?.toISOString() ?? null,
    feedback: s.feedback,
    score: s.score != null ? String(s.score) : null,
  }));

  return (
    <CohortStudentAdminDetailView
      cohortId={cohort.id}
      cohortName={cohort.name}
      courseTitle={cohort.course.title}
      studentName={enrollment.user.name}
      studentEmail={enrollment.user.email}
      enrollmentStatus={enrollment.status}
      isTrial={enrollment.isTrial}
      trialExpiresAt={enrollment.trialExpiresAt?.toISOString() ?? null}
      overallProgress={overallProgress}
      lessonsCompleted={snapLessonsCompleted}
      lessonsTotal={snapLessonsTotal}
      deliverables={deliverables}
    />
  );
}
