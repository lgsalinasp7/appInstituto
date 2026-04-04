import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_ADMIN", "ACADEMY_TEACHER"],
  async (request, user, tenantId) => {
    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId") || undefined;
    const cohortId = url.searchParams.get("cohortId") || undefined;

    // Teacher: auto-filtrar por sus cohortes asignados
    const teacherUserId =
      user.platformRole === "ACADEMY_TEACHER" ? user.id : undefined;

    const events = await AcademyCohortService.listEventsForCalendar(tenantId, {
      courseId,
      cohortId,
      teacherUserId,
    });

    return NextResponse.json({ success: true, data: events });
  }
);
