import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, _user, tenantId) => {
    const cohorts = await AcademyCohortService.listByTenant(tenantId);

    const events = cohorts.map((cohort) => ({
      id: cohort.id,
      name: cohort.name,
      courseId: cohort.courseId,
      courseTitle: cohort.course.title,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      status: cohort.status,
      schedule: cohort.schedule,
    }));

    return NextResponse.json({ success: true, data: events });
  }
);
