import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";
import { adminLessonMetaPatchSchema } from "@/modules/academy/schemas/admin-lesson";

export const PATCH = withAcademyAuth(["ACADEMY_ADMIN"], async (request, _user, tenantId, context) => {
  const params = await context?.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
  }
  const body = await request.json();
  const parsed = adminLessonMetaPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  try {
    const meta = await AcademyCourseService.upsertLessonMeta(id, tenantId, {
      ...parsed.data,
      concepts:
        parsed.data.concepts === undefined
          ? undefined
          : parsed.data.concepts === null
            ? null
            : parsed.data.concepts,
    });
    return NextResponse.json({ success: true, data: meta });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "Lección no encontrada") {
        return NextResponse.json({ success: false, error: e.message }, { status: 404 });
      }
      if (e.message === "Animación no válida") {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
      }
    }
    throw e;
  }
});
