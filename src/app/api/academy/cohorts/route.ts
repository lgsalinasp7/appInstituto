import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { AcademyCohortService } from "@/modules/academia";
import { createCohortSchema } from "@/modules/academia/schemas";
import { auditCohortAdminAction } from "@/modules/academia/services/academy-cohort-lifecycle.service";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, user, tenantId) => {
    const roleRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { platformRole: true },
    });
    const role = roleRow?.platformRole;

    let cohorts;
    if (role === "ACADEMY_ADMIN") {
      cohorts = await AcademyCohortService.listByTenant(tenantId);
    } else if (role === "ACADEMY_TEACHER") {
      cohorts = await AcademyCohortService.listForTeacher(user.id, tenantId);
    } else {
      cohorts = await AcademyCohortService.listForStudent(user.id, tenantId);
    }

    return NextResponse.json({ success: true, data: cohorts });
  }
);

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, user, tenantId) => {
    const body = await request.json();
    const parsed = createCohortSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const cohort = await AcademyCohortService.create(tenantId, parsed.data);
    await auditCohortAdminAction(
      { tenantId, actorUserId: user.id },
      "CREATE_COHORT",
      {
        cohortId: cohort.id,
        name: cohort.name,
        kind: cohort.kind,
        courseId: cohort.courseId,
      }
    );
    return NextResponse.json({ success: true, data: cohort });
  }
);
