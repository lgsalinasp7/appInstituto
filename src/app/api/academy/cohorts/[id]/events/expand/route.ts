import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { createRecurringCohortEventsSchema } from "@/modules/academia/schemas";

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.id;
    if (!cohortId) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createRecurringCohortEventsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const result = await AcademyCohortService.expandRecurringPattern(
      cohortId,
      tenantId,
      parsed.data
    );
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Cohorte no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  }
);
