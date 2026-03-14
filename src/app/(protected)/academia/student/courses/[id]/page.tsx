import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseOverview } from "@/modules/academia/components/student/CourseOverview";

export default async function AcademiaStudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { id: courseId } = await params;

  const enrollment = await prisma.academyEnrollment.findFirst({
    where: { userId: user.id, courseId },
  });

  if (enrollment?.status === "ACTIVE" && enrollment.cohortId) {
    redirect(`/academia/student/cohort/${enrollment.cohortId}`);
  }

  const course = await prisma.academyCourse.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            select: { id: true, title: true, duration: true, order: true },
          },
        },
      },
      cohorts: {
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  });

  if (!course) notFound();

  let completedLessonIds: string[] = [];
  if (enrollment) {
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const progress = await prisma.academyStudentProgress.findMany({
      where: { userId: user.id, lessonId: { in: lessonIds }, completed: true },
      select: { lessonId: true },
    });
    completedLessonIds = progress.map((p) => p.lessonId);
  }

  const data = {
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      description2: course.description2,
      duration: course.duration,
      durationWeeks: course.durationWeeks,
      level: course.level,
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        order: m.order,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration,
          order: l.order,
        })),
      })),
    },
    cohorts: course.cohorts.map((c) => ({
      id: c.id,
      name: c.name,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      status: c.status,
    })),
    completedLessonIds,
    enrollmentStatus: enrollment?.status ?? null,
  };

  return <CourseOverview data={data} />;
}
