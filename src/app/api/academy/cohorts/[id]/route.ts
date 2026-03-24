import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";
import { createCohortSchema } from "@/modules/academia/schemas";
import {
  AcademyCohortLifecycleService,
  auditCohortAdminAction,
} from "@/modules/academia/services/academy-cohort-lifecycle.service";

export const PATCH = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, user, tenantId, context) => {
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
    await auditCohortAdminAction(
      { tenantId, actorUserId: user.id },
      "UPDATE_COHORT",
      { cohortId: id, patch: parsed.data } as Prisma.InputJsonValue
    );
    return NextResponse.json({ success: true });
  }
);

export const DELETE = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (_request, user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    try {
      await AcademyCohortLifecycleService.deleteCohortIfEmpty(
        { tenantId, actorUserId: user.id },
        id
      );
      return NextResponse.json({ success: true });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudo eliminar el cohorte";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
  }
);
