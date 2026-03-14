/**
 * RUTAS DE API — KaledAcademy
 *
 * Estructura de carpetas a crear:
 *
 * app/api/academia/
 * ├── lessons/[lessonId]/
 * │   ├── complete/route.ts       ← POST
 * │   └── video/route.ts          ← POST
 * ├── quizzes/[quizId]/
 * │   └── answer/route.ts         ← POST
 * ├── cral/[challengeId]/
 * │   └── complete/route.ts       ← POST
 * ├── deliverables/[deliverableId]/
 * │   ├── submit/route.ts         ← POST (student)
 * │   └── review/route.ts         ← POST (teacher)
 * ├── kaled/
 * │   └── route.ts                ← POST (chat)
 * └── teacher/
 *     └── dashboard/route.ts      ← GET
 *
 * Todos usan el patrón de auth de KaledSoft: getCurrentUser() + tenantSlug check
 */

// ============================================================
// app/api/academia/lessons/[lessonId]/complete/route.ts
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const completeLessonSchema = z.object({
  videoProgress: z.number().min(0).max(100).optional(),
  timeSpentSec: z.number().positive().optional(),
});

export async function POST_completeLesson(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = completeLessonSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  // Verificar que la lección existe y el usuario está matriculado
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: params.lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });

  const enrollment = await prisma.academyEnrollment.findFirst({
    where: { userId: user.id, courseId: lesson.module.courseId, status: "ACTIVE" },
  });
  if (!enrollment) return NextResponse.json({ error: "No matriculado" }, { status: 403 });

  // Upsert progreso
  const progress = await prisma.academyStudentProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: params.lessonId } },
    create: {
      userId: user.id,
      lessonId: params.lessonId,
      completed: true,
      completedAt: new Date(),
      videoProgress: body.data.videoProgress ?? 100,
      timeSpentSec: body.data.timeSpentSec,
    },
    update: {
      completed: true,
      completedAt: new Date(),
      videoProgress: body.data.videoProgress ?? 100,
      updatedAt: new Date(),
    },
  });

  // Recalcular progreso del enrollment
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.academyLesson.count({
      where: { module: { courseId: lesson.module.courseId }, isActive: true },
    }),
    prisma.academyStudentProgress.count({
      where: {
        userId: user.id,
        completed: true,
        lesson: { module: { courseId: lesson.module.courseId } },
      },
    }),
  ]);

  const newProgress = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  await prisma.academyEnrollment.update({
    where: { userId_courseId: { userId: user.id, courseId: lesson.module.courseId } },
    data: { progress: newProgress },
  });

  // Refresh snapshot (async, no bloquea)
  prisma.academyStudentSnapshot.upsert({
    where: { enrollmentId: enrollment.id },
    create: {
      userId: user.id,
      cohortId: enrollment.cohortId ?? "",
      enrollmentId: enrollment.id,
      overallProgress: newProgress,
      lessonsCompleted: completedLessons,
      lessonsTotal: totalLessons,
      tenantId: (await prisma.tenant.findUnique({ where: { slug: "kaledacademy" }, select: { id: true } }))?.id ?? "",
    },
    update: {
      overallProgress: newProgress,
      lessonsCompleted: completedLessons,
      lessonsTotal: totalLessons,
      lastActivityAt: new Date(),
    },
  }).catch(console.error);

  return NextResponse.json({ progress, newProgress });
}

// ============================================================
// app/api/academia/quizzes/[quizId]/answer/route.ts
// ============================================================
const quizAnswerSchema = z.object({
  selectedOptionId: z.string().min(1),
});

export async function POST_quizAnswer(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = quizAnswerSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Opción inválida" }, { status: 400 });

  // Check if already answered
  const existing = await prisma.academyQuizResult.findUnique({
    where: { userId_quizId: { userId: user.id, quizId: params.quizId } },
  });
  if (existing) return NextResponse.json({ alreadyAnswered: true, result: existing });

  const option = await prisma.academyQuizOption.findUnique({
    where: { id: body.data.selectedOptionId },
  });
  if (!option || option.quizId !== params.quizId) {
    return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
  }

  const result = await prisma.academyQuizResult.create({
    data: {
      userId: user.id,
      quizId: params.quizId,
      selectedOptionId: body.data.selectedOptionId,
      isCorrect: option.isCorrect,
    },
  });

  return NextResponse.json({
    alreadyAnswered: false,
    isCorrect: option.isCorrect,
    feedback: option.feedback,
    result,
  });
}

// ============================================================
// app/api/academia/cral/[challengeId]/complete/route.ts
// ============================================================
const cralCompleteSchema = z.object({
  githubUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

export async function POST_cralComplete(
  req: NextRequest,
  { params }: { params: { challengeId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = cralCompleteSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const challenge = await prisma.academyCRALChallenge.findUnique({
    where: { id: params.challengeId },
  });
  if (!challenge) return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });

  const completion = await prisma.academyCRALCompletion.upsert({
    where: { userId_challengeId: { userId: user.id, challengeId: params.challengeId } },
    create: {
      userId: user.id,
      challengeId: params.challengeId,
      phase: challenge.phase,
      completed: true,
      completedAt: new Date(),
      githubUrl: body.data.githubUrl || undefined,
      notes: body.data.notes,
    },
    update: {
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ completion });
}

// ============================================================
// app/api/academia/deliverables/[deliverableId]/submit/route.ts
// ============================================================
const deliverableSubmitSchema = z.object({
  githubUrl: z.string().url().optional().or(z.literal("")),
  deployUrl: z.string().url().optional().or(z.literal("")),
  checkedItems: z.array(z.string()).min(1),
});

export async function POST_submitDeliverable(
  req: NextRequest,
  { params }: { params: { deliverableId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = deliverableSubmitSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.errors[0].message }, { status: 400 });
  }

  const deliverable = await prisma.academyDeliverable.findUnique({
    where: { id: params.deliverableId },
  });
  if (!deliverable) return NextResponse.json({ error: "Entregable no encontrado" }, { status: 404 });

  const submission = await prisma.academyDeliverableSubmission.upsert({
    where: { userId_deliverableId: { userId: user.id, deliverableId: params.deliverableId } },
    create: {
      userId: user.id,
      deliverableId: params.deliverableId,
      githubUrl: body.data.githubUrl || undefined,
      deployUrl: body.data.deployUrl || undefined,
      checkedItems: body.data.checkedItems,
      status: "ENTREGADO",
      submittedAt: new Date(),
    },
    update: {
      githubUrl: body.data.githubUrl || undefined,
      deployUrl: body.data.deployUrl || undefined,
      checkedItems: body.data.checkedItems,
      status: "ENTREGADO",
      submittedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}

// ============================================================
// app/api/academia/kaled/route.ts
// POST — Chat con Kaled usando @ai-sdk/anthropic (ya instalado)
// ============================================================
export async function POST_kaledChat(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const messages = body.messages ?? [];
  const lessonId = body.lessonId as string | undefined;

  // Verificar límite de uso (plan gratis = 10/día)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usageCount = await prisma.academyKaledSession.count({
    where: {
      userId: user.id,
      createdAt: { gte: today },
    },
  });

  // El límite se puede ajustar según el plan del tenant
  const DAILY_LIMIT = 20;
  if (usageCount >= DAILY_LIMIT) {
    return NextResponse.json({
      reply: "Has alcanzado el límite de consultas de hoy (20). ¡Vuelve mañana con más preguntas! 💪",
    });
  }

  // Construir system prompt
  const systemPrompt = `Eres Kaled, el arquitecto de sistemas que tutoriza el AI SaaS Engineering Bootcamp de KaledSoft Technologies en Montería, Colombia.

PERSONALIDAD:
- Motivador, directo y hablas de tú.
- Usas analogías colombianas para conceptos técnicos.
- NUNCA das el código completo sin antes preguntar qué intentó el estudiante.
- Siempre preguntas "¿qué intentaste primero?" antes de ayudar con código.

METODOLOGÍA CRAL:
- CONSTRUIR: El estudiante debe intentar antes de recibir la solución.
- ROMPER: Motiva a experimentar qué pasa cuando algo falla.
- AUDITAR: Cuando generes código, di qué deberían revisar.
- LANZAR: El entregable debe existir en internet, no solo en local.

REGLAS:
- Responde en español colombiano, máximo 3 párrafos.
- Si el estudiante pide que hagas su entregable, declina y guíalo.
- Stack del bootcamp: Next.js, Prisma, Clerk, MercadoPago, Wompi, OpenAI, Anthropic, Vercel.`;

  try {
    // Usar @ai-sdk/anthropic (ya instalado en el proyecto)
    const { generateText } = await import("ai");
    const { anthropic } = await import("@ai-sdk/anthropic");

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      system: systemPrompt,
      messages: messages.slice(-10).map((m: { role: string; text: string }) => ({
        role: m.role === "kaled" ? "assistant" : "user",
        content: m.text,
      })),
      maxTokens: 500,
      temperature: 0.4,
    });

    // Registrar la sesión
    prisma.academyKaledSession.create({
      data: {
        conversationId: `temp-${Date.now()}`,
        userId: user.id,
        lessonId,
        tenantId: (await prisma.tenant.findUnique({
          where: { slug: "kaledacademy" }, select: { id: true },
        }))?.id ?? "",
      },
    }).catch(() => {}); // No bloquear la respuesta

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("[Kaled API Error]", error);
    return NextResponse.json({
      reply: "Tuve un problema técnico. ¿Puedes intentar de nuevo? Mientras, cuéntame qué intentaste hasta ahora 🤔",
    });
  }
}

// ============================================================
// app/api/academia/teacher/dashboard/route.ts
// GET — Dashboard del instructor
// ============================================================
export async function GET_teacherDashboard(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Verificar que es instructor
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, tenantId: true },
  });
  if (
    dbUser?.platformRole !== "ACADEMY_TEACHER" &&
    dbUser?.platformRole !== "ACADEMY_ADMIN"
  ) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });
  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });

  const cohort = await prisma.academyCohort.findFirst({
    where: { tenantId: tenant.id, status: "ACTIVE" },
    include: { enrollments: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });

  if (!cohort) {
    return NextResponse.json({ cohortName: "Sin cohorte activa", totalStudents: 0 });
  }

  const snapshots = await prisma.academyStudentSnapshot.findMany({
    where: { cohortId: cohort.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { overallProgress: "desc" },
  });

  const pendingDeliverables = await prisma.academyDeliverableSubmission.findMany({
    where: {
      status: "ENTREGADO",
      deliverable: {
        lesson: {
          module: { course: { cohorts: { some: { id: cohort.id } } } },
        },
      },
    },
    include: {
      user: { select: { name: true } },
      deliverable: { select: { title: true, weekNumber: true } },
    },
    orderBy: { submittedAt: "asc" },
    take: 10,
  });

  const avgProgress =
    snapshots.length > 0
      ? snapshots.reduce((a, s) => a + Number(s.overallProgress), 0) / snapshots.length
      : 0;

  return NextResponse.json({
    cohortName: cohort.name,
    totalStudents: cohort.enrollments.length,
    activeStudents: snapshots.filter(
      (s) => s.lastActivityAt && Date.now() - new Date(s.lastActivityAt).getTime() < 7 * 86400000
    ).length,
    avgProgress,
    deliverablesPending: pendingDeliverables.length,
    students: snapshots.map((s, i) => ({
      id: s.userId,
      name: s.user.name ?? s.user.email,
      email: s.user.email,
      image: s.user.image,
      progress: Number(s.overallProgress),
      lessonsCompleted: s.lessonsCompleted,
      deliverablesApproved: s.deliverablesApproved,
      quizzesPassed: s.quizzesPassed,
      kaledInteractions: s.kaledInteractions,
      lastActivityAt: s.lastActivityAt?.toISOString(),
    })),
    pendingDeliverables: pendingDeliverables.map((d) => ({
      id: d.id,
      studentName: d.user.name ?? "Estudiante",
      deliverableTitle: d.deliverable.title,
      weekNumber: d.deliverable.weekNumber,
      submittedAt: d.submittedAt?.toISOString() ?? new Date().toISOString(),
      githubUrl: d.githubUrl,
      deployUrl: d.deployUrl,
    })),
    weeklyData: [
      { week: "S1", completions: 12, deliverables: 2 },
      { week: "S2", completions: 18, deliverables: 3 },
      { week: "S3", completions: 15, deliverables: 2 },
      { week: "S4", completions: 22, deliverables: 4 },
      { week: "S5", completions: 9, deliverables: 1 },
    ],
  });
}
