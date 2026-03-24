import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortLifecycleService } from "@/modules/academia/services/academy-cohort-lifecycle.service";
import { z } from "zod";

const bodySchema = z.object({
  targetCohortId: z.string().min(1),
  enrollmentIds: z.array(z.string()).optional(),
});

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, user, tenantId, context) => {
    const params = await context?.params;
    const sourceCohortId = params?.id;
    if (!sourceCohortId) {
      return NextResponse.json(
        { success: false, error: "ID de cohorte requerido" },
        { status: 400 }
      );
    }
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    try {
      const result = await AcademyCohortLifecycleService.moveEnrollmentsToCohort(
        { tenantId, actorUserId: user.id },
        {
          sourceCohortId,
          targetCohortId: parsed.data.targetCohortId,
          enrollmentIds: parsed.data.enrollmentIds,
        }
      );
      return NextResponse.json({ success: true, data: result });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al mover matrículas";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
  }
);
