import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { AcademyCohortLifecycleService } from "@/modules/academia/services/academy-cohort-lifecycle.service";

const selectUser = {
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

export const GET = withAcademyAuth(
  ["ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, user, tenantId) => {
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
      const users = await prisma.user.findMany({
        where: {
          tenantId,
          platformRole: "ACADEMY_STUDENT",
          isActive: true,
          academyEnrollments: {
            some: {
              cohortId: { in: cohortIds },
              status: "ACTIVE",
            },
          },
        },
        select: selectUser,
      });
      return NextResponse.json({ success: true, data: users });
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId,
        platformRole: { in: ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"] },
        isActive: true,
      },
      select: selectUser,
    });
    return NextResponse.json({ success: true, data: users });
  }
);
