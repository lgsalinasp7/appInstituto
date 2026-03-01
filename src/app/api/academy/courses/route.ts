import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";
import { createCourseSchema } from "@/modules/academia/schemas";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, _user, tenantId) => {
    const courses = await AcademyCourseService.listByTenant(tenantId);
    return NextResponse.json({ success: true, data: courses });
  }
);

export const POST = withAcademyAuth(
  ["ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (request, user, tenantId) => {
    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const course = await AcademyCourseService.create(tenantId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: course });
  }
);
