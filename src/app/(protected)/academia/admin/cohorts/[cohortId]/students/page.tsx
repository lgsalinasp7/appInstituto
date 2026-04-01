import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CohortStudentsView } from "@/modules/academia/components/admin/CohortStudentsView";

interface PageProps {
  params: Promise<{ cohortId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cohortId } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "kaledacademy.kaledsoft.tech";
  const protocol = headersList.get("x-forwarded-proto") === "https" ? "https" : "http";
  const canonical = `${protocol}://${host}/academia/admin/cohorts/${cohortId}/students`;
  return {
    title: "Estudiantes del cohorte | Academia",
    description: "Lista de estudiantes matriculados en el cohorte.",
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}

export default async function AdminCohortStudentsPage({ params }: PageProps) {
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

  const { cohortId } = await params;

  const cohort = await prisma.academyCohort.findFirst({
    where: { id: cohortId, tenantId },
    select: {
      id: true,
      name: true,
      course: { select: { title: true } },
    },
  });

  if (!cohort) {
    notFound();
  }

  const enrollments = await prisma.academyEnrollment.findMany({
    where: { cohortId: cohort.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const rows = enrollments.map((e) => ({
    enrollmentId: e.id,
    userId: e.user.id,
    name: e.user.name,
    email: e.user.email,
    status: e.status,
    isTrial: e.isTrial,
    enrolledAt: e.enrolledAt.toISOString(),
    trialExpiresAt: e.trialExpiresAt?.toISOString() ?? null,
  }));

  return (
    <CohortStudentsView
      cohortId={cohort.id}
      cohortName={cohort.name}
      courseTitle={cohort.course.title}
      rows={rows}
    />
  );
}
