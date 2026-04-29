import { NextRequest, NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { INSTRUCTOR_ROLES } from "@/modules/academia/config/academy-platform-roles.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  evaluationId: z.string().cuid(),
  approved: z.boolean(),
  visibleToStudent: z.boolean().optional(),
});

async function POST_handler(
  _req: NextRequest,
  user: { id: string },
  tenantId: string
) {
  const body = bodySchema.safeParse(await _req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: "evaluationId y approved requeridos" },
      { status: 400 }
    );
  }

  const { evaluationId, approved, visibleToStudent } = body.data;

  const evaluation = await prisma.kaledDeliverableEvaluation.findFirst({
    where: { id: evaluationId, tenantId },
  });

  if (!evaluation) {
    return NextResponse.json({ error: "EvaluaciÃ³n no encontrada" }, { status: 404 });
  }

  await prisma.kaledDeliverableEvaluation.update({
    where: { id: evaluationId },
    data: {
      status: approved ? "APPROVED" : "REJECTED",
      approvedBy: user.id,
      approvedAt: new Date(),
      visibleToStudent: visibleToStudent ?? (approved ? true : false),
    },
  });

  return NextResponse.json({ ok: true });
}

export const POST = withAcademyAuth(INSTRUCTOR_ROLES, POST_handler);
