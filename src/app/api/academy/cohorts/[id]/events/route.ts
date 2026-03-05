import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { createCohortEventSchema } from "@/modules/academia/schemas";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const events = await AcademyCohortService.listEvents(id, tenantId);
    if (events === null) {
      return NextResponse.json({ success: false, error: "Cohorte no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: events });
  }
);

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = createCohortEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const event = await AcademyCohortService.createEvent(id, tenantId, parsed.data);
    if (event === null) {
      return NextResponse.json({ success: false, error: "Cohorte no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: event });
  }
);
