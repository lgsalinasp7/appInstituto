import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";
import { adminReplaceCralSchema } from "@/modules/academia/schemas/admin-lesson";

export const PUT = withAcademyAuth(["ACADEMY_ADMIN"], async (request, _user, tenantId, context) => {
  const params = await context?.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
  }
  const body = await request.json();
  const parsed = adminReplaceCralSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Datos invÃ¡lidos" },
      { status: 400 }
    );
  }
  try {
    await AcademyCourseService.replaceLessonCralChallenges(id, tenantId, parsed.data.challenges);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "LecciÃ³n no encontrada") {
      return NextResponse.json({ success: false, error: e.message }, { status: 404 });
    }
    throw e;
  }
});
