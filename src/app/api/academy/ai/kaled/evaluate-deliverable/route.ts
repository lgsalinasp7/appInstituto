import { NextRequest, NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { INSTRUCTOR_ROLES } from "@/modules/academia/config/academy-platform-roles.config";
import { prisma } from "@/lib/prisma";
import { generateText, gateway } from "ai";
import { z } from "zod";

const bodySchema = z.object({
  submissionId: z.string().cuid(),
});

function getCRITERIA(phase: string): string {
  const criteria: Record<string, string> = {
    CONSTRUIR: "Â¿Funciona? Â¿El estudiante lo entiende? Â¿Puede explicarlo?",
    ROMPER: "Â¿IdentificÃ³ los fallos? Â¿AprendiÃ³ del error? Â¿Puede prevenirlo?",
    AUDITAR: "Â¿Es seguro? Â¿Escala? Â¿Es legible? Â¿Sigue buenas prÃ¡cticas?",
    LANZAR: "Â¿EstÃ¡ desplegado? Â¿Tiene URL real? Â¿EstÃ¡ documentado? Â¿Puede defenderlo?",
  };
  return criteria[phase] ?? criteria.LANZAR;
}

async function POST_handler(
  _req: NextRequest,
  _user: { id: string },
  tenantId: string
) {
  const body = bodySchema.safeParse((await _req.json()) ?? {});
  if (!body.success) {
    return NextResponse.json({ error: "submissionId requerido" }, { status: 400 });
  }

  const { submissionId } = body.data;

  const submission = await prisma.academyDeliverableSubmission.findUnique({
    where: { id: submissionId },
    include: {
      deliverable: {
        include: {
          lesson: {
            include: { meta: true },
          },
          checkItems: true,
        },
      },
      user: { select: { name: true, tenantId: true } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Entregable no encontrado" }, { status: 404 });
  }

  // Aislamiento multi-tenant: validar tanto el deliverable como el user
  if (
    submission.deliverable.tenantId !== tenantId ||
    submission.user.tenantId !== tenantId
  ) {
    return NextResponse.json(
      { success: false, error: "Entregable no disponible para tu instituciÃ³n" },
      { status: 403 }
    );
  }

  const cralPhase = (submission.deliverable.lesson.meta?.phaseTarget as string) ?? "LANZAR";
  const checkedCount = submission.checkedItems.length;
  const totalItems = submission.deliverable.checkItems.length;
  const studentName = submission.user.name ?? "Estudiante";

  const prompt = `Eres Kaled, tutor de KaledAcademy. EvalÃºa cualitativamente este entregable.

ENTREGABLE: ${submission.deliverable.title}
SEMANA: ${submission.deliverable.weekNumber}
FASE CRAL: ${cralPhase}
ESTUDIANTE: ${studentName}

CHECKLIST COMPLETADO: ${checkedCount}/${totalItems} Ã­tems marcados
GITHUB: ${submission.githubUrl ?? "No proporcionado"}
DEPLOY: ${submission.deployUrl ?? "No proporcionado"}

CRITERIOS SEGÃšN FASE ${cralPhase}:
${getCRITERIA(cralPhase)}

Genera evaluaciÃ³n cualitativa en JSON:
{
  "feedbackConstruir": "evaluaciÃ³n de si construyÃ³ y entiende",
  "feedbackRomper": "evaluaciÃ³n de experimentaciÃ³n",
  "feedbackAuditar": "evaluaciÃ³n de criterio tÃ©cnico",
  "feedbackLanzar": "evaluaciÃ³n de si estÃ¡ desplegado",
  "overallFeedback": "retroalimentaciÃ³n principal motivadora (2 pÃ¡rrafos)",
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "improvements": ["mejora 1", "mejora 2"],
  "socraticQuestions": ["pregunta para reflexionar 1", "pregunta 2"],
  "readyForApproval": true
}`;

  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5"),
    prompt,
    maxOutputTokens: 700,
    temperature: 0.25,
  });

  let evaluation: Record<string, unknown>;
  try {
    evaluation = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    evaluation = { overallFeedback: text, readyForApproval: false };
  }

  const saved = await prisma.kaledDeliverableEvaluation.create({
    data: {
      tenantId,
      submissionId,
      userId: submission.userId,
      cralPhase,
      feedbackConstruir: (evaluation.feedbackConstruir as string) ?? null,
      feedbackRomper: (evaluation.feedbackRomper as string) ?? null,
      feedbackAuditar: (evaluation.feedbackAuditar as string) ?? null,
      feedbackLanzar: (evaluation.feedbackLanzar as string) ?? null,
      overallFeedback: (evaluation.overallFeedback as string) ?? text,
      strengths: (evaluation.strengths as string[]) ?? [],
      improvements: (evaluation.improvements as string[]) ?? [],
      socraticQuestions: (evaluation.socraticQuestions as string[]) ?? [],
      status: "PENDING_APPROVAL",
      visibleToStudent: false,
    },
  });

  return NextResponse.json({
    evaluation: saved,
    readyForApproval: evaluation.readyForApproval ?? false,
  });
}

export const POST = withAcademyAuth(INSTRUCTOR_ROLES, POST_handler);
