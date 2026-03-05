import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { prisma } from "@/lib/prisma";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.cohortId;
    if (!cohortId) {
      return NextResponse.json({ success: false, error: "cohortId requerido" }, { status: 400 });
    }

    const cohort = await AcademyCohortService.getByIdForStudent(cohortId, tenantId);
    if (!cohort) {
      return NextResponse.json({ success: false, error: "Cohorte no encontrado" }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso (enrolled en el curso o en el cohorte)
    const enrollment = await prisma.academyEnrollment.findFirst({
      where: {
        userId: user.id,
        courseId: cohort.courseId,
        status: "ACTIVE",
      },
    });

    if (!enrollment && user.platformRole !== "ACADEMY_ADMIN" && user.platformRole !== "ACADEMY_TEACHER") {
      return NextResponse.json({ success: false, error: "No tienes acceso a este cohorte" }, { status: 403 });
    }

    // Obtener progreso del usuario
    const lessonIds = cohort.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const progressRecords = await prisma.academyStudentProgress.findMany({
      where: { userId: user.id, lessonId: { in: lessonIds }, completed: true },
      select: { lessonId: true },
    });
    const completedLessonIds = progressRecords.map((r) => r.lessonId);

    return NextResponse.json({
      success: true,
      data: {
        cohort: {
          id: cohort.id,
          name: cohort.name,
          startDate: cohort.startDate,
          endDate: cohort.endDate,
          status: cohort.status,
          courseId: cohort.courseId,
        },
        course: cohort.course,
        events: cohort.events,
        assessments: cohort.assessments,
        members: cohort.enrollments.map((e) => ({
          id: e.user.id,
          name: e.user.name,
          email: e.user.email,
          image: e.user.image,
        })),
        completedLessonIds,
      },
    });
  }
);
