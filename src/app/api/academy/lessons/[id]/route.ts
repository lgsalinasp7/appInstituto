import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";
import { createLessonSchema } from "@/modules/academia/schemas";
import { GET_lesson } from "@/modules/academy/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const GET = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) => GET_lesson(req, user, tenantId, context)
);

export const PATCH = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, _tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = createLessonSchema.partial().omit({ moduleId: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const lesson = await AcademyCourseService.updateLesson(id, parsed.data);
    return NextResponse.json({ success: true, data: lesson });
  }
);

export const DELETE = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (_request, _user, _tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    await AcademyCourseService.deleteLesson(id);
    return NextResponse.json({ success: true });
  }
);
