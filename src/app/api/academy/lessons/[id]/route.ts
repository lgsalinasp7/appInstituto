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
  async (request, _user, tenantId, context) => {
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
    try {
      const lesson = await AcademyCourseService.updateLesson(id, tenantId, parsed.data);
      return NextResponse.json({ success: true, data: lesson });
    } catch (e) {
      if (e instanceof Error && e.message === "Lección no encontrada") {
        return NextResponse.json({ success: false, error: e.message }, { status: 404 });
      }
      throw e;
    }
  }
);

export const DELETE = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    try {
      await AcademyCourseService.deleteLesson(id, tenantId);
      return NextResponse.json({ success: true });
    } catch (e) {
      if (e instanceof Error && e.message === "Lección no encontrada") {
        return NextResponse.json({ success: false, error: e.message }, { status: 404 });
      }
      throw e;
    }
  }
);
