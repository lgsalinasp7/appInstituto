// ============================================================
// KALEDACADEMY — API Handlers (con withAcademyAuth)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth";
import {
  courseService,
  progressService,
  quizService,
  cralService,
  deliverableService,
  cohortService,
  saasProjectService,
  kaledAIService,
  badgeService,
  analyticsService,
} from "@/modules/academy/services/academy.service";
import { prisma } from "@/lib/prisma";
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

type AcademyContext = { params: Promise<Record<string, string>> };

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

const LESSON_ACCESS_DENIED_MESSAGES = [
  "Esta lección no está incluida en tu acceso de prueba",
  "Tu acceso de prueba ha expirado",
  "Esta lección aún no está habilitada para tu cohorte",
  "No estás matriculado en este curso",
  "No tienes asignación de profesor en este curso",
] as const;

function serverError(err: unknown) {
  console.error("[KaledAcademy API Error]", err);
  const message = err instanceof Error ? err.message : "Error interno";
  if (message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (LESSON_ACCESS_DENIED_MESSAGES.some((m) => message.includes(m))) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  );
}

// ============================================================
// GET /api/academy/courses
// ============================================================
export async function GET_courses(
  _req: NextRequest,
  _user: AuthenticatedUser,
  tenantId: string
) {
  try {
    const course = await courseService.getBootcampCourse(tenantId);
    if (!course)
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    return NextResponse.json(course);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/academy/courses/[courseId]/sidebar
// ============================================================
export async function GET_courseSidebar(
  _req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const courseId = params.courseId ?? params.id;
    if (!courseId) return badRequest("courseId o id requerido");
    const modules = await courseService.getSidebarModules(
      courseId,
      user.id,
      tenantId,
      user.platformRole ?? null
    );
    return NextResponse.json(modules);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/academy/lessons/[lessonId]
// ============================================================
export async function GET_lesson(
  _req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const lessonId = params.lessonId ?? params.id;
    if (!lessonId) return badRequest("lessonId o id requerido");
    const data = await courseService.getLessonWithProgress(
      lessonId,
      tenantId,
      user.id,
      { platformRole: user.platformRole ?? null }
    );
    // Log trial activity (fire-and-forget)
    prisma.academyEnrollment
      .findFirst({
        where: { userId: user.id, courseId: data.lesson.module.courseId, isTrial: true },
      })
      .then((e) => {
        if (e) {
          import("@/lib/trial-activity").then(({ logTrialActivity, TRIAL_ACTIONS }) =>
            logTrialActivity(user.id, tenantId, TRIAL_ACTIONS.LESSON_VIEW, "lesson", lessonId)
          );
        }
      })
      .catch(() => {});
    return NextResponse.json(data);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/lessons/[lessonId]/complete
// ============================================================
const completeLessonSchema = z.object({
  videoProgress: z.number().min(0).max(100).optional(),
  timeSpentSec: z.number().positive().optional(),
});

export async function POST_completeLesson(
  req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const lessonId = params.lessonId ?? params.id;
    if (!lessonId) return badRequest("lessonId o id requerido");
    const body = completeLessonSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const progress = await progressService.markLessonCompleted(
      user.id,
      lessonId,
      tenantId,
      body.data
    );
    const newBadges = await badgeService.checkAndAward(user.id, tenantId);
    return NextResponse.json({ progress, newBadges });
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/lessons/[lessonId]/video
// ============================================================
const videoProgressSchema = z.object({
  videoProgress: z.number().min(0).max(100),
});

export async function POST_videoProgress(
  req: NextRequest,
  user: AuthenticatedUser,
  _tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const lessonId = params.lessonId ?? params.id;
    if (!lessonId) return badRequest("lessonId o id requerido");
    const body = videoProgressSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const progress = await progressService.updateVideoProgress(
      user.id,
      lessonId,
      body.data.videoProgress
    );
    return NextResponse.json(progress);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/quizzes/[quizId]/answer
// ============================================================
const quizAnswerSchema = z.object({
  selectedOptionId: z.union([z.string().cuid(), z.string().uuid()]),
});

export async function POST_quizAnswer(
  req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const quizId = params.quizId;
    if (!quizId) return badRequest("quizId requerido");
    const body = quizAnswerSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Opción inválida");

    const result = await quizService.submitAnswer(
      user.id,
      quizId,
      body.data.selectedOptionId,
      tenantId
    );
    return NextResponse.json(result);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/cral/[challengeId]/complete
// ============================================================
const cralCompleteSchema = z.object({
  githubUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST_cralComplete(
  req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const challengeId = params.challengeId;
    if (!challengeId) return badRequest("challengeId requerido");
    const body = cralCompleteSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const completion = await cralService.markPhaseComplete(
      user.id,
      challengeId,
      tenantId,
      body.data
    );
    const newBadges = await badgeService.checkAndAward(user.id, tenantId);
    return NextResponse.json({ completion, newBadges });
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/deliverables/[id]/submit
// ============================================================
const deliverableSubmitSchema = z.object({
  githubUrl: z.string().url().optional(),
  deployUrl: z.string().url().optional(),
  checkedItems: z.array(z.string()).min(1, "Debes marcar al menos un ítem"),
});

export async function POST_submitDeliverable(
  req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const deliverableId = params.id ?? params.deliverableId;
    if (!deliverableId) return badRequest("deliverableId requerido");
    const body = deliverableSubmitSchema.safeParse(await req.json());
    if (!body.success) return badRequest(body.error.issues[0]?.message ?? "Datos inválidos");

    const submission = await deliverableService.submit(
      user.id,
      deliverableId,
      body.data
    );
    const newBadges = await badgeService.checkAndAward(user.id, tenantId);
    return NextResponse.json({ submission, newBadges }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/deliverables/[id]/review
// ============================================================
const deliverableReviewSchema = z.object({
  status: z.enum(["APROBADO", "RECHAZADO", "EN_REVISION"]),
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().max(2000).optional(),
});

export async function POST_reviewDeliverable(
  req: NextRequest,
  user: AuthenticatedUser,
  _tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const submissionId = params.id ?? params.submissionId;
    if (!submissionId) return badRequest("submissionId requerido");
    const body = deliverableReviewSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const result = await deliverableService.review(
      submissionId,
      user.id,
      body.data
    );
    return NextResponse.json(result);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/academy/cohorts/[id]/deliverables/pending
// ============================================================
export async function GET_pendingDeliverables(
  _req: NextRequest,
  _user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const cohortId = params.cohortId ?? params.id;
    if (!cohortId) return badRequest("cohortId o id requerido");
    const pending = await deliverableService.getPendingReviews(cohortId, tenantId);
    return NextResponse.json(pending);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/academy/cohorts/active
// ============================================================
export async function GET_activeCohort(
  _req: NextRequest,
  _user: AuthenticatedUser,
  tenantId: string
) {
  try {
    const cohort = await cohortService.getActiveCohort(tenantId);
    return NextResponse.json(cohort);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/academy/cohorts/[cohortId]/ranking
// ============================================================
export async function GET_studentRanking(
  _req: NextRequest,
  _user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const cohortId = params.cohortId ?? params.id;
    if (!cohortId) return badRequest("cohortId o id requerido");
    const ranking = await cohortService.getStudentRanking(cohortId, tenantId);
    return NextResponse.json(ranking);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/academy/cohorts/[cohortId]/analytics
// ============================================================
export async function GET_cohortAnalytics(
  _req: NextRequest,
  _user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const cohortId = params.cohortId ?? params.id;
    if (!cohortId) return badRequest("cohortId o id requerido");
    const analytics = await analyticsService.getCohortAnalytics(
      cohortId,
      tenantId
    );
    return NextResponse.json(analytics);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/projects
// ============================================================
const projectSchema = z.object({
  cohortId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  githubUrl: z.string().url().optional(),
  deployUrl: z.string().url().optional(),
  domainUrl: z.string().url().optional(),
  techStack: z.record(z.string(), z.string()).optional(),
  planFree: z.string().max(500).optional(),
  planPro: z.string().max(500).optional(),
  realUsers: z.number().int().min(0).optional(),
  lightScorePerformance: z.number().min(0).max(100).optional(),
  lightScoreAccessibility: z.number().min(0).max(100).optional(),
});

export async function POST_upsertProject(
  req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string
) {
  try {
    const body = projectSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const { cohortId, ...data } = body.data;
    const project = await saasProjectService.upsertProject(
      user.id,
      cohortId,
      tenantId,
      data
    );
    if (data.deployUrl) {
      await badgeService.checkAndAward(user.id, tenantId);
    }
    return NextResponse.json(project);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/ai/kaled
// ============================================================
const kaledChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1),
  lessonId: z.string().cuid().optional(),
  conversationId: z.string().cuid().optional(),
});

export async function POST_kaledChat(
  req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string
) {
  try {
    const body = kaledChatSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Mensajes inválidos");

    const { messages, lessonId } = body.data;

    const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content;
    const systemPrompt = await kaledAIService.buildSystemPrompt(
      user.id,
      tenantId,
      lessonId,
      lastUserMsg
    );

    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
      maxOutputTokens: 600,
      temperature: 0.4,
    });

    prisma.academyStudentSnapshot
      .updateMany({
        where: { userId: user.id, tenantId },
        data: { kaledInteractions: { increment: 1 } },
      })
      .catch(console.error);

    // Detectar patrones de error en el último mensaje del usuario (fire-and-forget)
    if (lastUserMsg) {
      const { detectsError } = await import("@/lib/academia/kaled-socratic");
      const { updateErrorPatterns } = await import("@/lib/academia/kaled-error-memory");
      if (detectsError(lastUserMsg)) {
        updateErrorPatterns({
          userId: user.id,
          tenantId,
          patterns: ["error_detectado"],
          lessonId,
        }).catch(() => {});
      }
    }

    return result.toTextStreamResponse();
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/academy/badges
// ============================================================
export async function GET_badges(
  _req: NextRequest,
  user: AuthenticatedUser,
  _tenantId: string
) {
  try {
    const badges = await prisma.academyBadgeEarned.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });
    return NextResponse.json(badges);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/academy/demo-day/[projectId]/result
// ============================================================
const demoDaySchema = z.object({
  cohortId: z.string().cuid(),
  functionality: z.number().min(0).max(100),
  architecture: z.number().min(0).max(100),
  code: z.number().min(0).max(100),
  realUsers: z.number().min(0).max(100),
  aiCriteria: z.number().min(0).max(100),
  instructorNotes: z.string().max(2000).optional(),
  nintyDayPlan: z.string().max(2000).optional(),
  linkedinPostUrl: z.string().url().optional(),
});

export async function POST_demoDayResult(
  req: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: AcademyContext
) {
  try {
    const params = context ? await context.params : {};
    const projectId = params.projectId;
    if (!projectId) return badRequest("projectId requerido");
    const body = demoDaySchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const result = await saasProjectService.recordDemoDayResult(
      projectId,
      body.data.cohortId,
      tenantId,
      {
        functionality: body.data.functionality,
        architecture: body.data.architecture,
        code: body.data.code,
        realUsers: body.data.realUsers,
        aiCriteria: body.data.aiCriteria,
        instructorNotes: body.data.instructorNotes,
        nintyDayPlan: body.data.nintyDayPlan,
        linkedinPostUrl: body.data.linkedinPostUrl,
      }
    );
    await badgeService.checkAndAward(user.id, tenantId);
    return NextResponse.json(result);
  } catch (err) {
    return serverError(err);
  }
}
