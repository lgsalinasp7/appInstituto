import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.cohortId;
    if (!cohortId) {
      return NextResponse.json({ success: false, error: "cohortId requerido" }, { status: 400 });
    }

    const data = await AcademyCohortService.getCohortDataForStudent(
      user.id,
      cohortId,
      user.platformRole ?? "ACADEMY_STUDENT",
      tenantId
    );
    if (!data) {
      return NextResponse.json({ success: false, error: "Cohorte no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        cohort: {
          ...data.cohort,
          startDate: new Date(data.cohort.startDate),
          endDate: new Date(data.cohort.endDate),
        },
      },
    });
  }
);
