// app/api/academia/kaled/evaluate-deliverable/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { submissionId } = await req.json();

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
      user: { select: { name: true } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Entregable no encontrado" }, { status: 404 });
  }

  const cralPhase = submission.deliverable.lesson.meta?.phaseTarget ?? "LANZAR";
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
  "readyForApproval": true/false
}`;

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4-5" as any,
    prompt,
    maxTokens: 700,
    temperature: 0.25,
  });

  let evaluation: any;
  try {
    evaluation = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    evaluation = { overallFeedback: text, readyForApproval: false };
  }

  // Guardar evaluación como PENDING_APPROVAL
  const saved = await prisma.kaledDeliverableEvaluation.create({
    data: {
      tenantId: submission.deliverable.lesson.meta?.tenantId ?? "",
      submissionId,
      userId: submission.userId,
      cralPhase: cralPhase as string,
      feedbackConstruir: evaluation.feedbackConstruir,
      feedbackRomper: evaluation.feedbackRomper,
      feedbackAuditar: evaluation.feedbackAuditar,
      feedbackLanzar: evaluation.feedbackLanzar,
      overallFeedback: evaluation.overallFeedback,
      strengths: evaluation.strengths ?? [],
      improvements: evaluation.improvements ?? [],
      socraticQuestions: evaluation.socraticQuestions ?? [],
      status: "PENDING_APPROVAL",
      visibleToStudent: false,
    },
  });

  return NextResponse.json({ evaluation: saved, readyForApproval: evaluation.readyForApproval });
}

function getCRITERIA(phase: string): string {
  const criteria: Record<string, string> = {
    CONSTRUIR: "¿Funciona? ¿El estudiante lo entiende? ¿Puede explicarlo?",
    ROMPER:    "¿Identificó los fallos? ¿Aprendió del error? ¿Puede prevenirlo?",
    AUDITAR:   "¿Es seguro? ¿Escala? ¿Es legible? ¿Sigue buenas prácticas?",
    LANZAR:    "¿Está desplegado? ¿Tiene URL real? ¿Está documentado? ¿Puede defenderlo?",
  };
  return criteria[phase] ?? criteria.LANZAR;
}