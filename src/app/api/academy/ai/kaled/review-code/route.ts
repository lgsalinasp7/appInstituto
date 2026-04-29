import { NextRequest, NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { ACADEMY_ROLES } from "@/modules/academia/config/academy-platform-roles.config";
import { reviewCodeWithCRAL } from "@/lib/academia/kaled-code-reviewer";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  code: z.string().min(1).max(50000),
  lessonId: z.string().cuid().optional(),
});

async function POST_handler(
  req: NextRequest,
  user: { id: string; name: string | null },
  tenantId: string
) {
  const body = bodySchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "code y opcionalmente lessonId requeridos" }, { status: 400 });
  }

  const { code, lessonId } = body.data;

  let cralPhase = "CONSTRUIR";
  let lessonTitle = "SesiÃ³n general";
  let weekNumber = 1;

  if (lessonId) {
    const lesson = await prisma.academyLesson.findUnique({
      where: { id: lessonId },
      include: {
        meta: true,
        module: {
          include: { course: true },
        },
      },
    });
    if (lesson) {
      // Validar aislamiento multi-tenant: la lecciÃ³n debe pertenecer al mismo tenant del usuario
      if (lesson.module.course.tenantId !== tenantId) {
        return NextResponse.json(
          { success: false, error: "LecciÃ³n no disponible para tu instituciÃ³n" },
          { status: 403 }
        );
      }
      lessonTitle = lesson.title;
      weekNumber = lesson.meta?.weekNumber ?? 1;
      cralPhase = (lesson.meta?.phaseTarget as string) ?? "CONSTRUIR";
    }
  }

  const result = await reviewCodeWithCRAL({
    code,
    cralPhase,
    lessonTitle,
    weekNumber,
    userId: user.id,
    tenantId,
    lessonId,
    userName: user.name ?? "Estudiante",
  });

  return NextResponse.json(result);
}

export const POST = withAcademyAuth(ACADEMY_ROLES, POST_handler);
