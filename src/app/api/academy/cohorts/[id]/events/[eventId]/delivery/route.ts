import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { patchCohortEventDeliverySchema } from "@/modules/academia/schemas";

export const PATCH = withAcademyAuth(
  ["ACADEMY_ADMIN", "ACADEMY_TEACHER"],
  async (request, user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.id;
    const eventId = params?.eventId;
    if (!cohortId || !eventId) {
      return NextResponse.json({ success: false, error: "IDs requeridos" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = patchCohortEventDeliverySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const result = await AcademyCohortService.markEventDelivered(
      eventId,
      cohortId,
      tenantId,
      user.id,
      parsed.data.delivered,
      user.platformRole ?? ""
    );

    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  }
);
