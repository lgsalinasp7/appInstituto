import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { courseService } from "@/modules/academy/services/academy.service";

export const GET = withAcademyAuth(["ACADEMY_ADMIN"], async (_request, _user, tenantId, context) => {
  const params = await context?.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
  }
  try {
    const data = await courseService.getLessonForAdminEdit(id, tenantId);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    if (e instanceof Error && e.message === "Lección no encontrada") {
      return NextResponse.json({ success: false, error: e.message }, { status: 404 });
    }
    throw e;
  }
});
