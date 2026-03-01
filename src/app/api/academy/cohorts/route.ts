import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { createCohortSchema } from "@/modules/academia/schemas";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, _user, tenantId) => {
    const cohorts = await AcademyCohortService.listByTenant(tenantId);
    return NextResponse.json({ success: true, data: cohorts });
  }
);

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, tenantId) => {
    const body = await request.json();
    const parsed = createCohortSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const cohort = await AcademyCohortService.create(tenantId, parsed.data);
    return NextResponse.json({ success: true, data: cohort });
  }
);
