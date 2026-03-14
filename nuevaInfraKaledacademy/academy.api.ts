// ============================================================
// KALEDACADEMY — API Routes (Next.js App Router)
// Arquitectura de carpetas sugerida dentro de KaledSoft
//
// apps/kaledacademy/app/api/
// ├── courses/
// │   └── route.ts              GET /api/courses
// ├── courses/[courseId]/
// │   └── route.ts              GET /api/courses/:courseId
// ├── lessons/[lessonId]/
// │   ├── route.ts              GET /api/lessons/:lessonId
// │   ├── complete/route.ts     POST /api/lessons/:lessonId/complete
// │   └── video/route.ts        POST /api/lessons/:lessonId/video
// ├── quizzes/[quizId]/
// │   └── answer/route.ts       POST /api/quizzes/:quizId/answer
// ├── cral/[challengeId]/
// │   └── complete/route.ts     POST /api/cral/:challengeId/complete
// ├── deliverables/[deliverableId]/
// │   ├── submit/route.ts       POST submit
// │   └── review/route.ts       POST review (instructor only)
// ├── cohorts/
// │   ├── route.ts              GET cohorte activa
// │   ├── [cohortId]/students   GET ranking
// │   └── [cohortId]/analytics  GET métricas
// ├── projects/
// │   └── route.ts              GET/POST proyecto SaaS
// ├── ai/
// │   └── kaled/route.ts        POST chat con Kaled (streaming)
// └── badges/route.ts           GET badges del estudiante
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";   // helper de sesión de KaledSoft
import {
  courseService, progressService, quizService,
  cralService, deliverableService, cohortService,
  saasProjectService, kaledAIService, badgeService, analyticsService
} from "./academy.service";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ─── Helper: obtener sesión y tenantId garantizados ──────────

async function requireAuth(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || !session?.user?.tenantId) {
    throw new Error("UNAUTHORIZED");
  }
  return { userId: session.user.id, tenantId: session.user.tenantId };
}

function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function serverError(err: unknown) {
  console.error("[KaledAcademy API Error]", err);
  const message = err instanceof Error ? err.message : "Error interno";
  if (message === "UNAUTHORIZED") return unauthorized();
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}

// ============================================================
// GET /api/courses — Obtener el bootcamp del tenant
// ============================================================
export async function GET_courses(req: NextRequest) {
  try {
    const { tenantId } = await requireAuth(req);
    const course = await courseService.getBootcampCourse(tenantId);
    if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    return NextResponse.json(course);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/courses/[courseId]/sidebar — Sidebar del módulo
// ============================================================
export async function GET_courseSidebar(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const modules = await courseService.getSidebarModules(params.courseId, userId, tenantId);
    return NextResponse.json(modules);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/lessons/[lessonId] — Lección con progreso
// ============================================================
export async function GET_lesson(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const data = await courseService.getLessonWithProgress(params.lessonId, tenantId, userId);
    return NextResponse.json(data);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/lessons/[lessonId]/complete — Marcar completada
// ============================================================
const completeLessonSchema = z.object({
  videoProgress: z.number().min(0).max(100).optional(),
  timeSpentSec: z.number().positive().optional()
});

export async function POST_completeLesson(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const body = completeLessonSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const progress = await progressService.markLessonCompleted(
      userId, params.lessonId, tenantId, body.data
    );

    // Verificar y otorgar badges
    const newBadges = await badgeService.checkAndAward(userId, tenantId);

    return NextResponse.json({ progress, newBadges });
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/lessons/[lessonId]/video — Actualizar progreso video
// ============================================================
const videoProgressSchema = z.object({ videoProgress: z.number().min(0).max(100) });

export async function POST_videoProgress(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { userId } = await requireAuth(req);
    const body = videoProgressSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const progress = await progressService.updateVideoProgress(
      userId, params.lessonId, body.data.videoProgress
    );
    return NextResponse.json(progress);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/quizzes/[quizId]/answer — Responder quiz
// ============================================================
const quizAnswerSchema = z.object({ selectedOptionId: z.string().cuid() });

export async function POST_quizAnswer(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = await requireAuth(req);
    const body = quizAnswerSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Opción inválida");

    const result = await quizService.submitAnswer(
      userId, params.quizId, body.data.selectedOptionId
    );
    return NextResponse.json(result);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/cral/[challengeId]/complete — Completar fase CRAL
// ============================================================
const cralCompleteSchema = z.object({
  githubUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional()
});

export async function POST_cralComplete(
  req: NextRequest,
  { params }: { params: { challengeId: string } }
) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const body = cralCompleteSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const completion = await cralService.markPhaseComplete(
      userId, params.challengeId, tenantId, body.data
    );
    const newBadges = await badgeService.checkAndAward(userId, tenantId);

    return NextResponse.json({ completion, newBadges });
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/deliverables/[deliverableId]/submit — Entregar
// ============================================================
const deliverableSubmitSchema = z.object({
  githubUrl: z.string().url().optional(),
  deployUrl: z.string().url().optional(),
  checkedItems: z.array(z.string()).min(1, "Debes marcar al menos un ítem")
});

export async function POST_submitDeliverable(
  req: NextRequest,
  { params }: { params: { deliverableId: string } }
) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const body = deliverableSubmitSchema.safeParse(await req.json());
    if (!body.success) return badRequest(body.error.errors[0].message);

    const submission = await deliverableService.submit(
      userId, params.deliverableId, body.data
    );
    const newBadges = await badgeService.checkAndAward(userId, tenantId);

    return NextResponse.json({ submission, newBadges }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/deliverables/[submissionId]/review — Calificar (instructor)
// ============================================================
const deliverableReviewSchema = z.object({
  status: z.enum(["APROBADO", "RECHAZADO", "EN_REVISION"]),
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().max(2000).optional()
});

export async function POST_reviewDeliverable(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { userId } = await requireAuth(req);
    const body = deliverableReviewSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    // TODO: verificar que el userId tiene rol ACADEMY_TEACHER o ACADEMY_ADMIN

    const result = await deliverableService.review(
      params.submissionId, userId, body.data as any
    );
    return NextResponse.json(result);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/cohorts/active — Cohorte activa
// ============================================================
export async function GET_activeCohort(req: NextRequest) {
  try {
    const { tenantId } = await requireAuth(req);
    const cohort = await cohortService.getActiveCohort(tenantId);
    return NextResponse.json(cohort);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/cohorts/[cohortId]/ranking — Ranking de estudiantes
// ============================================================
export async function GET_studentRanking(
  req: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  try {
    const { tenantId } = await requireAuth(req);
    const ranking = await cohortService.getStudentRanking(params.cohortId, tenantId);
    return NextResponse.json(ranking);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/cohorts/[cohortId]/analytics — Métricas (instructor)
// ============================================================
export async function GET_cohortAnalytics(
  req: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  try {
    const { tenantId } = await requireAuth(req);
    const analytics = await analyticsService.getCohortAnalytics(params.cohortId, tenantId);
    return NextResponse.json(analytics);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/projects — Crear/actualizar proyecto SaaS
// ============================================================
const projectSchema = z.object({
  cohortId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  githubUrl: z.string().url().optional(),
  deployUrl: z.string().url().optional(),
  domainUrl: z.string().url().optional(),
  techStack: z.record(z.string()).optional(),
  planFree: z.string().max(500).optional(),
  planPro: z.string().max(500).optional(),
  realUsers: z.number().int().min(0).optional(),
  lightScorePerformance: z.number().min(0).max(100).optional(),
  lightScoreAccessibility: z.number().min(0).max(100).optional()
});

export async function POST_upsertProject(req: NextRequest) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const body = projectSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const { cohortId, ...data } = body.data;
    const project = await saasProjectService.upsertProject(userId, cohortId, tenantId, data);

    // Verificar badge de FIRST_DEPLOY si hay deployUrl
    if (data.deployUrl) {
      await badgeService.checkAndAward(userId, tenantId);
    }

    return NextResponse.json(project);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/ai/kaled — Chat con Kaled (streaming)
// ============================================================
const kaledChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).min(1),
  lessonId: z.string().cuid().optional(),
  conversationId: z.string().cuid().optional()
});

export async function POST_kaledChat(req: NextRequest) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const body = kaledChatSchema.safeParse(await req.json());
    if (!body.success) return badRequest("Mensajes inválidos");

    const { messages, lessonId, conversationId } = body.data;

    // Crear sesión si es nueva
    if (!conversationId) {
      await kaledAIService.startSession(userId, tenantId, { lessonId });
    }

    // Construir system prompt contextual
    const systemPrompt = await kaledAIService.buildSystemPrompt(userId, tenantId, lessonId);

    // Streaming con Vercel AI SDK
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages,
      maxTokens: 600,
      temperature: 0.4
    });

    // Incrementar contador de interacciones con Kaled en el snapshot
    // (en background, no bloquea la respuesta)
    prisma.academyStudentSnapshot
      .updateMany({
        where: { userId, tenantId },
        data: { kaledInteractions: { increment: 1 } }
      })
      .catch(console.error);

    return result.toDataStreamResponse();
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// GET /api/badges — Badges del estudiante
// ============================================================
export async function GET_badges(req: NextRequest) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const badges = await prisma.academyBadgeEarned.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" }
    });
    return NextResponse.json(badges);
  } catch (err) {
    return serverError(err);
  }
}

// ============================================================
// POST /api/demo-day/[projectId]/result — Registrar Demo Day
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
  linkedinPostUrl: z.string().url().optional()
});

export async function POST_demoDayResult(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId, tenantId } = await requireAuth(req);
    const body = demoDaySchema.safeParse(await req.json());
    if (!body.success) return badRequest("Datos inválidos");

    const result = await saasProjectService.recordDemoDayResult(
      params.projectId, body.data.cohortId, tenantId,
      {
        functionality: body.data.functionality,
        architecture: body.data.architecture,
        code: body.data.code,
        realUsers: body.data.realUsers,
        aiCriteria: body.data.aiCriteria,
        instructorNotes: body.data.instructorNotes,
        nintyDayPlan: body.data.nintyDayPlan,
        linkedinPostUrl: body.data.linkedinPostUrl
      }
    );

    // Verificar badge DEMO_DAY_PASSED
    await badgeService.checkAndAward(userId, tenantId);

    return NextResponse.json(result);
  } catch (err) {
    return serverError(err);
  }
}
