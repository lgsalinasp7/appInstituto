import { NextRequest, NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { INSTRUCTOR_ROLES } from "@/modules/academy/config/roles";
import { prisma } from "@/lib/prisma";
import { generateText, gateway } from "ai";
import { z } from "zod";

const bodySchema = z.object({
  submissionId: z.string().cuid(),
});

function getCRITERIA(phase: string): string {
  const criteria: Record<string, string> = {
    CONSTRUIR: "¿Funciona? ¿El estudiante lo entiende? ¿Puede explicarlo?",
    ROMPER: "¿Identificó los fallos? ¿Aprendió del error? ¿Puede prevenirlo?",
    AUDITAR: "¿Es seguro? ¿Escala? ¿Es legible? ¿Sigue buenas prácticas?",
    LANZAR: "¿Está desplegado? ¿Tiene URL real? ¿Está documentado? ¿Puede defenderlo?",
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
      { success: false, error: "Entregable no disponible para tu institución" },
      { status: 403 }
    );
  }

  const cralPhase = (submission.deliverable.lesson.meta?.phaseTarget as string) ?? "LANZAR";
  const checkedCount = submission.checkedItems.length;
  const totalItems = submission.deliverable.checkItems.length;
  const studentName = submission.user.name ?? "Estudiante";

  const prompt = `Eres Kaled, tutor de KaledAcademy. Evalúa cualitativamente este entregable.

ENTREGABLE: ${submission.deliverable.title}
SEMANA: ${submission.deliverable.weekNumber}
FASE CRAL: ${cralPhase}
ESTUDIANTE: ${studentName}

CHECKLIST COMPLETADO: ${checkedCount}/${totalItems} ítems marcados
GITHUB: ${submission.githubUrl ?? "No proporcionado"}
DEPLOY: ${submission.deployUrl ?? "No proporcionado"}

CRITERIOS SEGÚN FASE ${cralPhase}:
${getCRITERIA(cralPhase)}

Genera evaluación cualitativa en JSON:
{
  "feedbackConstruir": "evaluación de si construyó y entiende",
  "feedbackRomper": "evaluación de experimentación",
  "feedbackAuditar": "evaluación de criterio técnico",
  "feedbackLanzar": "evaluación de si está desplegado",
  "overallFeedback": "retroalimentación principal motivadora (2 párrafos)",
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
