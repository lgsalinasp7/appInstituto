import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { patchCohortLessonAccessSchema } from "@/modules/academia/schemas";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    if (user.platformRole === "ACADEMY_STUDENT") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
    }

    if (user.platformRole === "ACADEMY_TEACHER") {
      const { prisma } = await import("@/lib/prisma");
      const assigned = await prisma.academyCohortTeacherAssignment.findFirst({
        where: { cohortId: id, teacherId: user.id },
      });
      if (!assigned) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
      }
    }

    const data = await AcademyCohortService.getLessonAccessEditorState(id, tenantId);
    if (!data) {
      return NextResponse.json({ success: false, error: "Cohorte no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }
);

export const PATCH = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = patchCohortLessonAccessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    try {
      await AcademyCohortService.setLessonReleases(id, tenantId, user.id, parsed.data);
      return NextResponse.json({ success: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
  }
);
