import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortLifecycleService } from "@/modules/academia/services/academy-cohort-lifecycle.service";
import { z } from "zod";

const bodySchema = z.object({
  sourceCohortId: z.string().min(1),
  targetCohortId: z.string().min(1),
});

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, user, tenantId) => {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    try {
      const result = await AcademyCohortLifecycleService.mergeCohorts(
        { tenantId, actorUserId: user.id },
        parsed.data
      );
      return NextResponse.json({ success: true, data: result });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al unir cohortes";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
  }
);
