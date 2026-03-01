import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyEnrollmentService } from "@/modules/academia";
import { createEnrollmentSchema } from "@/modules/academia/schemas";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT"],
  async (_request, user, _tenantId) => {
    const enrollments = await AcademyEnrollmentService.listByUser(user.id);
    return NextResponse.json({ success: true, data: enrollments });
  }
);

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, tenantId) => {
    const body = await request.json();
    const parsed = createEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const enrollment = await AcademyEnrollmentService.enroll(parsed.data, tenantId);
    return NextResponse.json({ success: true, data: enrollment });
  }
);
