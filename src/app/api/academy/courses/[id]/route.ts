import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { AcademyCourseService } from "@/modules/academia";
import { AcademyCohortLifecycleService } from "@/modules/academia/services/academy-cohort-lifecycle.service";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const course = await AcademyCourseService.getById(id, tenantId);
    if (!course) {
      return NextResponse.json({ success: false, error: "Curso no encontrado" }, { status: 404 });
    }

    const roleRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { platformRole: true },
    });
    const role = roleRow?.platformRole;

    if (role === "ACADEMY_STUDENT") {
      const en = await prisma.academyEnrollment.findFirst({
        where: { userId: user.id, courseId: id, status: "ACTIVE" },
        select: { cohortId: true },
      });
      const onlyId = en?.cohortId;
      return NextResponse.json({
        success: true,
        data: {
          ...course,
          cohorts: onlyId
            ? course.cohorts.filter((c) => c.id === onlyId)
            : [],
        },
      });
    }

    if (role === "ACADEMY_TEACHER") {
      const cohortIds = await AcademyCohortLifecycleService.listCohortIdsForTeacher(
        user.id,
        tenantId
      );
      return NextResponse.json({
        success: true,
        data: {
          ...course,
          cohorts: course.cohorts.filter((c) => cohortIds.includes(c.id)),
        },
      });
    }

    return NextResponse.json({ success: true, data: course });
  }
);
