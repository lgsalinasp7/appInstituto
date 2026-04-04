import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT"],
  async (_request, user, tenantId) => {
    const result = await AcademyCohortService.listEventsForStudentCalendar(
      user.id,
      tenantId
    );

    return NextResponse.json({ success: true, data: result });
  }
);
