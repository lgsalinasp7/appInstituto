import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const course = await AcademyCourseService.getById(id, tenantId);
    if (!course) {
      return NextResponse.json({ success: false, error: "Curso no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: course });
  }
);
