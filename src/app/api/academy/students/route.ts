import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { AcademyCohortLifecycleService } from "@/modules/academia/services/academy-cohort-lifecycle.service";

const selectUserAdminDefault = {
  id: true,
  name: true,
  email: true,
  platformRole: true,
  createdAt: true,
  academyEnrollments: {
    where: { isTrial: true },
    take: 1,
    select: { id: true },
  },
} as const;

function selectUserWithCohortEnrollments(effectiveCohortIds: string[]) {
  return {
    id: true,
    name: true,
    email: true,
    platformRole: true,
    createdAt: true,
    academyEnrollments: {
      where: {
        status: "ACTIVE" as const,
        OR: [
          { isTrial: true },
          { cohortId: { in: effectiveCohortIds } },
        ],
      },
      select: {
        id: true,
        isTrial: true,
        cohortId: true,
        cohort: { select: { name: true } },
        course: { select: { title: true } },
      },
    },
  };
}

export const GET = withAcademyAuth(
  ["ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (request, user, tenantId) => {
    const cohortIdParam = request.nextUrl.searchParams.get("cohortId");

    const roleRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { platformRole: true },
    });

    if (roleRow?.platformRole === "ACADEMY_TEACHER") {
      const cohortIds = await AcademyCohortLifecycleService.listCohortIdsForTeacher(
        user.id,
        tenantId
      );
      if (cohortIds.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      if (cohortIdParam && !cohortIds.includes(cohortIdParam)) {
        return NextResponse.json(
          { success: false, error: "No tienes acceso a este cohorte" },
          { status: 403 }
        );
      }

      const effectiveCohortIds = cohortIdParam ? [cohortIdParam] : cohortIds;

      const users = await prisma.user.findMany({
        where: {
          tenantId,
          platformRole: "ACADEMY_STUDENT",
          isActive: true,
          academyEnrollments: {
            some: {
              cohortId: { in: effectiveCohortIds },
              status: "ACTIVE",
            },
          },
        },
        select: selectUserWithCohortEnrollments(effectiveCohortIds),
      });
      return NextResponse.json({ success: true, data: users });
    }

    // ACADEMY_ADMIN
    if (cohortIdParam) {
      const cohort = await prisma.academyCohort.findFirst({
        where: { id: cohortIdParam, tenantId },
        select: { id: true },
      });
      if (!cohort) {
        return NextResponse.json({ success: false, error: "Cohorte no encontrado" }, { status: 404 });
      }

      const users = await prisma.user.findMany({
        where: {
          tenantId,
          platformRole: "ACADEMY_STUDENT",
          isActive: true,
          academyEnrollments: {
            some: {
              cohortId: cohort.id,
              status: "ACTIVE",
            },
          },
        },
        select: selectUserWithCohortEnrollments([cohort.id]),
      });
      return NextResponse.json({ success: true, data: users });
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId,
        platformRole: { in: ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"] },
        isActive: true,
      },
      select: selectUserAdminDefault,
    });
    return NextResponse.json({ success: true, data: users });
  }
);
