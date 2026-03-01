import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyProgressService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT"],
  async (_request, user, _tenantId, context) => {
    const params = await context?.params;
    const courseId = params?.courseId;
    if (!courseId) {
      return NextResponse.json({ success: false, error: "courseId requerido" }, { status: 400 });
    }
    const result = await AcademyProgressService.getByUserAndCourse(user.id, courseId);
    if (!result) {
      return NextResponse.json({ success: false, error: "No inscrito en este curso" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result });
  }
);
