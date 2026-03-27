import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { patchCohortEventSchema } from "@/modules/academia/schemas";

export const PATCH = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, _user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.id;
    const eventId = params?.eventId;
    if (!cohortId || !eventId) {
      return NextResponse.json({ success: false, error: "IDs requeridos" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = patchCohortEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const data: Prisma.AcademyCohortEventUpdateInput = {};
    if (d.title !== undefined) data.title = d.title;
    if (d.type !== undefined) data.type = d.type;
    if (d.dayOfWeek !== undefined) data.dayOfWeek = d.dayOfWeek;
    if (d.startTime !== undefined) data.startTime = d.startTime;
    if (d.endTime !== undefined) data.endTime = d.endTime;
    if (d.scheduledAt !== undefined) data.scheduledAt = d.scheduledAt;
    if (d.sessionOrder !== undefined) data.sessionOrder = d.sessionOrder;
    if (d.cancelled !== undefined) data.cancelled = d.cancelled;
    if (d.lessonId !== undefined) {
      data.lesson = d.lessonId
        ? { connect: { id: d.lessonId } }
        : { disconnect: true };
    }

    const updated = await AcademyCohortService.updateEvent(eventId, cohortId, tenantId, data);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Evento o cohorte no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  }
);
