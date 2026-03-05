import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";
import { createModuleSchema } from "@/modules/academia/schemas";

export const PATCH = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, _tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = createModuleSchema.partial().omit({ courseId: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const module = await AcademyCourseService.updateModule(id, parsed.data);
    return NextResponse.json({ success: true, data: module });
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
    await AcademyCourseService.deleteModule(id);
    return NextResponse.json({ success: true });
  }
);
