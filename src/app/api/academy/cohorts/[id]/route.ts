import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { createCohortSchema } from "@/modules/academia/schemas";

export const PATCH = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = createCohortSchema.partial().omit({ courseId: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    await AcademyCohortService.update(id, tenantId, parsed.data);
    return NextResponse.json({ success: true });
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
    await AcademyCohortService.delete(id, tenantId);
    return NextResponse.json({ success: true });
  }
);
