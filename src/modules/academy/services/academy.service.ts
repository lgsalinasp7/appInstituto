// ============================================================
// KALEDACADEMY — Servicios del Backend
// Integrado en KaledSoft multi-tenant
// ============================================================

import { prisma } from "@/lib/prisma";
import type { DeliverableStatus, SaasProjectStatus } from "@prisma/client";

// ============================================================
// SERVICIO 1: CURSOS Y MÓDULOS
// ============================================================

export const courseService = {
  async getBootcampCourse(tenantId: string) {
    return prisma.academyCourse.findFirst({
      where: { tenantId, isActive: true },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: {
                meta: true,
                quizzes: {
                  include: { options: true },
                  orderBy: { order: "asc" },
                },
                cralChallenges: { orderBy: { order: "asc" } },
                deliverables: {
                  include: { checkItems: { orderBy: { order: "asc" } } },
                },
              },
            },
          },
        },
        cohorts: {
          where: { status: "ACTIVE" },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    });
  },

  async getLessonWithProgress(lessonId: string, tenantId: string, userId?: string) {
    const lesson = await prisma.academyLesson.findUnique({
      where: { id: lessonId },
      include: {
        meta: true,
        module: { include: { course: true } },
        quizzes: { include: { options: true }, orderBy: { order: "asc" } },
        cralChallenges: { orderBy: { order: "asc" } },
        deliverables: {
          include: { checkItems: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!lesson) throw new Error("Lección no encontrada");

    if (!userId) return { lesson, progress: null };

    const [progress, quizResults, cralCompletions, deliverySubmission] =
      await Promise.all([
        prisma.academyStudentProgress.findUnique({
          where: { userId_lessonId: { userId, lessonId } },
        }),
        prisma.academyQuizResult.findMany({
          where: { userId, quizId: { in: lesson.quizzes.map((q) => q.id) } },
        }),
        prisma.academyCRALCompletion.findMany({
          where: {
            userId,
            challengeId: { in: lesson.cralChallenges.map((c) => c.id) },
          },
        }),
        lesson.deliverables[0]
          ? prisma.academyDeliverableSubmission.findUnique({
              where: {
                userId_deliverableId: {
                  userId,
                  deliverableId: lesson.deliverables[0].id,
                },
              },
            })
          : null,
      ]);

    return { lesson, progress, quizResults, cralCompletions, deliverySubmission };
  },

  async getSidebarModules(courseId: string, userId: string, tenantId: string) {
    const modules = await prisma.academyModule.findMany({
      where: { courseId, isActive: true },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            meta: { select: { weekNumber: true, dayOfWeek: true } },
          },
        },
      },
    });

    const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completedLessons = await prisma.academyStudentProgress.findMany({
      where: { userId, lessonId: { in: lessonIds }, completed: true },
      select: { lessonId: true },
    });
    const completedSet = new Set(completedLessons.map((p) => p.lessonId));

    return modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((l) => ({
        ...l,
        isCompleted: completedSet.has(l.id),
      })),
      completedCount: mod.lessons.filter((l) => completedSet.has(l.id)).length,
      totalCount: mod.lessons.length,
    }));
  },
};

// ============================================================
// SERVICIO 2: PROGRESO DEL ESTUDIANTE
// ============================================================

export const progressService = {
  async markLessonCompleted(
    userId: string,
    lessonId: string,
    tenantId: string,
    data: { videoProgress?: number; timeSpentSec?: number }
  ) {
    const lesson = await prisma.academyLesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new Error("Lección no encontrada");

    const enrollment = await prisma.academyEnrollment.findFirst({
      where: { userId, courseId: lesson.module.courseId, status: "ACTIVE" },
    });
    if (!enrollment)
      throw new Error("El usuario no está matriculado en este curso");

    const progress = await prisma.academyStudentProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        videoProgress: data.videoProgress ?? 100,
        timeSpentSec: data.timeSpentSec,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        videoProgress: data.videoProgress ?? 100,
        timeSpentSec: data.timeSpentSec,
        updatedAt: new Date(),
      },
    });

    await this._recalculateEnrollmentProgress(
      userId,
      lesson.module.courseId,
      tenantId
    );

    return progress;
  },

  async updateVideoProgress(
    userId: string,
    lessonId: string,
    videoProgress: number
  ) {
    return prisma.academyStudentProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        videoProgress,
        videoWatchedAt: new Date(),
      },
      update: {
        videoProgress,
        videoWatchedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async _recalculateEnrollmentProgress(
    userId: string,
    courseId: string,
    tenantId: string
  ) {
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.academyLesson.count({
        where: { module: { courseId, isActive: true }, isActive: true },
      }),
      prisma.academyStudentProgress.count({
        where: {
          userId,
          completed: true,
          lesson: { module: { courseId } },
        },
      }),
    ]);

    const progressPct =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    await prisma.academyEnrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { progress: progressPct },
    });

    await this._refreshStudentSnapshot(userId, courseId, tenantId);

    return progressPct;
  },

  async _refreshStudentSnapshot(
    userId: string,
    courseId: string,
    tenantId: string
  ) {
    const enrollment = await prisma.academyEnrollment.findFirst({
      where: { userId, courseId },
      include: { cohort: true },
    });
    if (!enrollment?.cohortId) return;

    const [
      lessonsCompleted,
      lessonsTotal,
      quizzesPassed,
      quizzesTotal,
      deliverablesSubmitted,
      deliverablesApproved,
      cralData,
      kaledInteractions,
    ] = await Promise.all([
      prisma.academyStudentProgress.count({
        where: { userId, completed: true },
      }),
      prisma.academyLesson.count({
        where: { module: { courseId }, isActive: true },
      }),
      prisma.academyQuizResult.count({ where: { userId, isCorrect: true } }),
      prisma.academyQuizResult.count({ where: { userId } }),
      prisma.academyDeliverableSubmission.count({ where: { userId } }),
      prisma.academyDeliverableSubmission.count({
        where: { userId, status: "APROBADO" },
      }),
      prisma.academyCRALCompletion.groupBy({
        by: ["phase"],
        where: { userId, completed: true },
        _count: { phase: true },
      }),
      prisma.academyKaledSession.count({ where: { userId } }),
    ]);

    const cralMap = cralData.reduce(
      (acc, row) => {
        acc[row.phase] = row._count.phase;
        return acc;
      },
      {} as Record<string, number>
    );

    await prisma.academyStudentSnapshot.upsert({
      where: { enrollmentId: enrollment.id },
      create: {
        userId,
        cohortId: enrollment.cohortId,
        enrollmentId: enrollment.id,
        overallProgress: enrollment.progress,
        lessonsCompleted,
        lessonsTotal,
        quizzesPassed,
        quizzesTotal,
        deliverablesSubmitted,
        deliverablesApproved,
        cralCompleted: cralMap,
        kaledInteractions,
        tenantId,
        lastActivityAt: new Date(),
      },
      update: {
        overallProgress: enrollment.progress,
        lessonsCompleted,
        lessonsTotal,
        quizzesPassed,
        quizzesTotal,
        deliverablesSubmitted,
        deliverablesApproved,
        cralCompleted: cralMap,
        kaledInteractions,
        lastActivityAt: new Date(),
        snapshotAt: new Date(),
      },
    });
  },
};

// ============================================================
// SERVICIO 3: QUIZZES
// ============================================================

export const quizService = {
  async submitAnswer(
    userId: string,
    quizId: string,
    selectedOptionId: string,
    tenantId: string
  ) {
    const existing = await prisma.academyQuizResult.findUnique({
      where: { userId_quizId: { userId, quizId } },
    });
    if (existing) return { alreadyAnswered: true, result: existing };

    const option = await prisma.academyQuizOption.findUnique({
      where: { id: selectedOptionId },
      include: { quiz: true },
    });
    if (!option || option.quizId !== quizId) throw new Error("Opción inválida");

    const result = await prisma.academyQuizResult.create({
      data: {
        userId,
        quizId,
        selectedOptionId,
        isCorrect: option.isCorrect,
        answeredAt: new Date(),
        tenantId: option.quiz.tenantId,
      },
    });

    return {
      alreadyAnswered: false,
      isCorrect: option.isCorrect,
      feedback: option.feedback,
      result,
    };
  },
};

// ============================================================
// SERVICIO 4: RETOS CRAL
// ============================================================

export const cralService = {
  async markPhaseComplete(
    userId: string,
    challengeId: string,
    tenantId: string,
    data: { githubUrl?: string; notes?: string }
  ) {
    const challenge = await prisma.academyCRALChallenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) throw new Error("Reto no encontrado");

    return prisma.academyCRALCompletion.upsert({
      where: { userId_challengeId: { userId, challengeId } },
      create: {
        userId,
        challengeId,
        phase: challenge.phase,
        completed: true,
        completedAt: new Date(),
        githubUrl: data.githubUrl,
        notes: data.notes,
        tenantId,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        githubUrl: data.githubUrl,
        notes: data.notes,
        updatedAt: new Date(),
      },
    });
  },

  async getLessonCRALStatus(userId: string, lessonId: string) {
    const challenges = await prisma.academyCRALChallenge.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
    });

    const completions = await prisma.academyCRALCompletion.findMany({
      where: {
        userId,
        challengeId: { in: challenges.map((c) => c.id) },
      },
    });
    const completedMap = new Map(completions.map((c) => [c.challengeId, c]));

    return challenges.map((ch) => ({
      ...ch,
      completion: completedMap.get(ch.id) ?? null,
      isDone: completedMap.get(ch.id)?.completed ?? false,
    }));
  },
};

// ============================================================
// SERVICIO 5: ENTREGABLES
// ============================================================

export const deliverableService = {
  async submit(
    userId: string,
    deliverableId: string,
    data: { githubUrl?: string; deployUrl?: string; checkedItems: string[] }
  ) {
    const deliverable = await prisma.academyDeliverable.findUnique({
      where: { id: deliverableId },
      include: { checkItems: true },
    });
    if (!deliverable) throw new Error("Entregable no encontrado");

    return prisma.academyDeliverableSubmission.upsert({
      where: { userId_deliverableId: { userId, deliverableId } },
      create: {
        userId,
        deliverableId,
        githubUrl: data.githubUrl,
        deployUrl: data.deployUrl,
        checkedItems: data.checkedItems,
        status: "ENTREGADO",
        submittedAt: new Date(),
      },
      update: {
        githubUrl: data.githubUrl,
        deployUrl: data.deployUrl,
        checkedItems: data.checkedItems,
        status: "ENTREGADO",
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async review(
    submissionId: string,
    reviewedById: string,
    data: { status: DeliverableStatus; score?: number; feedback?: string }
  ) {
    return prisma.academyDeliverableSubmission.update({
      where: { id: submissionId },
      data: {
        status: data.status,
        score: data.score,
        feedback: data.feedback,
        reviewedAt: new Date(),
        reviewedById,
      },
    });
  },

  async getPendingReviews(cohortId: string, _tenantId: string) {
    return prisma.academyDeliverableSubmission.findMany({
      where: {
        status: "ENTREGADO",
        deliverable: {
          lesson: {
            module: {
              course: { cohorts: { some: { id: cohortId } } },
            },
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        deliverable: { select: { title: true, weekNumber: true } },
      },
      orderBy: { submittedAt: "asc" },
    });
  },
};

// ============================================================
// SERVICIO 6: COHORTES Y ENROLLMENT
// ============================================================

export const cohortService = {
  async getActiveCohort(tenantId: string) {
    return prisma.academyCohort.findFirst({
      where: { tenantId, status: "ACTIVE" },
      include: {
        course: { select: { id: true, title: true } },
        enrollments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        events: { orderBy: { scheduledAt: "asc" } },
      },
    });
  },

  async enrollStudent(
    tenantId: string,
    courseId: string,
    cohortId: string,
    studentData: { userId: string }
  ) {
    const existingEnrollment = await prisma.academyEnrollment.findFirst({
      where: { userId: studentData.userId, courseId },
    });
    if (existingEnrollment)
      throw new Error("El estudiante ya está matriculado");

    const enrollment = await prisma.academyEnrollment.create({
      data: {
        userId: studentData.userId,
        courseId,
        cohortId,
        status: "ACTIVE",
        progress: 0,
      },
    });

    await prisma.academyStudentSnapshot.create({
      data: {
        userId: studentData.userId,
        cohortId,
        enrollmentId: enrollment.id,
        overallProgress: 0,
        lessonsCompleted: 0,
        lessonsTotal: 0,
        quizzesPassed: 0,
        quizzesTotal: 0,
        deliverablesSubmitted: 0,
        deliverablesApproved: 0,
        kaledInteractions: 0,
        tenantId,
      },
    });

    await prisma.academyCohort.update({
      where: { id: cohortId },
      data: { currentStudents: { increment: 1 } },
    });

    return enrollment;
  },

  async getStudentRanking(cohortId: string, tenantId: string) {
    const snapshots = await prisma.academyStudentSnapshot.findMany({
      where: { cohortId, tenantId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { overallProgress: "desc" },
    });

    return snapshots.map((s, index) => ({
      rank: index + 1,
      student: s.user,
      progress: Number(s.overallProgress),
      lessonsCompleted: s.lessonsCompleted,
      deliverablesApproved: s.deliverablesApproved,
      quizzesPassed: s.quizzesPassed,
      kaledInteractions: s.kaledInteractions,
      lastActivityAt: s.lastActivityAt,
    }));
  },
};

// ============================================================
// SERVICIO 7: PROYECTO SAAS DEL ESTUDIANTE
// ============================================================

export const saasProjectService = {
  async upsertProject(
    userId: string,
    cohortId: string,
    tenantId: string,
    data: {
      name: string;
      description?: string;
      githubUrl?: string;
      deployUrl?: string;
      domainUrl?: string;
      techStack?: Record<string, string>;
      planFree?: string;
      planPro?: string;
      realUsers?: number;
      status?: SaasProjectStatus;
      lightScorePerformance?: number;
      lightScoreAccessibility?: number;
    }
  ) {
    return prisma.academySaasProject.upsert({
      where: { userId_cohortId: { userId, cohortId } },
      create: { userId, cohortId, tenantId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  },

  async addWeeklyUpdate(
    projectId: string,
    weekNumber: number,
    data: {
      githubUrl?: string;
      deployUrl?: string;
      summary: string;
      cralDone?: Record<string, boolean>;
    }
  ) {
    return prisma.academySaasUpdate.upsert({
      where: { projectId_weekNumber: { projectId, weekNumber } },
      create: { projectId, weekNumber, ...data },
      update: { ...data },
    });
  },

  async recordDemoDayResult(
    projectId: string,
    cohortId: string,
    tenantId: string,
    scores: {
      functionality: number;
      architecture: number;
      code: number;
      realUsers: number;
      aiCriteria: number;
      instructorNotes?: string;
      nintyDayPlan?: string;
      linkedinPostUrl?: string;
    }
  ) {
    const total =
      (scores.functionality +
        scores.architecture +
        scores.code +
        scores.realUsers +
        scores.aiCriteria) /
      5;

    const result = await prisma.academyDemoDayResult.upsert({
      where: { projectId },
      create: {
        projectId,
        cohortId,
        tenantId,
        presentedAt: new Date(),
        scoreFunctionality: scores.functionality,
        scoreArchitecture: scores.architecture,
        scoreCode: scores.code,
        scoreRealUsers: scores.realUsers,
        scoreAICriteria: scores.aiCriteria,
        scoreTotal: total,
        passed: total >= 70,
        instructorNotes: scores.instructorNotes,
        nintyDayPlan: scores.nintyDayPlan,
        linkedinPostUrl: scores.linkedinPostUrl,
      },
      update: {
        scoreFunctionality: scores.functionality,
        scoreArchitecture: scores.architecture,
        scoreCode: scores.code,
        scoreRealUsers: scores.realUsers,
        scoreAICriteria: scores.aiCriteria,
        scoreTotal: total,
        passed: total >= 70,
        instructorNotes: scores.instructorNotes,
        nintyDayPlan: scores.nintyDayPlan,
        linkedinPostUrl: scores.linkedinPostUrl,
      },
    });

    await prisma.academySaasProject.update({
      where: { id: projectId },
      data: { status: result.passed ? "LANZADO" : "EN_PRODUCCION" },
    });

    return result;
  },
};

// ============================================================
// SERVICIO 8: KALED AI — TUTOR DE LA ACADEMIA
// ============================================================

export const kaledAIService = {
  async startSession(
    userId: string,
    tenantId: string,
    context: {
      lessonId?: string;
      moduleId?: string;
      cohortId?: string;
      sessionType?: string;
    }
  ) {
    const conversation = await prisma.aiConversation.create({
      data: {
        userId,
        tenantId,
        title: context.lessonId
          ? `Consulta sesión ${context.lessonId}`
          : "Consulta al tutor Kaled",
      },
    });

    await prisma.academyKaledSession.create({
      data: {
        conversationId: conversation.id,
        userId,
        tenantId,
        lessonId: context.lessonId,
        moduleId: context.moduleId,
        cohortId: context.cohortId,
        sessionType: (context.sessionType as "LESSON_SUPPORT") ?? "LESSON_SUPPORT",
      },
    });

    return conversation;
  },

  async buildSystemPrompt(
    userId: string,
    tenantId: string,
    lessonId?: string
  ): Promise<string> {
    const [snapshot, lesson] = await Promise.all([
      prisma.academyStudentSnapshot.findFirst({
        where: { userId, tenantId },
      }),
      lessonId
        ? prisma.academyLesson.findUnique({
            where: { id: lessonId },
            include: { meta: true, module: { include: { course: true } } },
          })
        : null,
    ]);

    const progressCtx = snapshot
      ? `El estudiante lleva ${Number(snapshot.overallProgress).toFixed(0)}% del bootcamp completado. ` +
        `Ha completado ${snapshot.lessonsCompleted} lecciones y ${snapshot.deliverablesApproved} entregables aprobados.`
      : "Estudiante recién ingresado.";

    const lessonCtx = lesson
      ? `Lección actual: "${lesson.title}" (Semana ${lesson.meta?.weekNumber ?? "?"}, ` +
        `Módulo: ${lesson.module.title}).`
      : "";

    return `Eres Kaled, el arquitecto de sistemas que tutoriza el AI SaaS Engineering Bootcamp de KaledSoft Technologies en Montería, Colombia.

PERSONALIDAD:
- Eres motivador, directo y hablas con el estudiante de tú.
- Usas analogías con la vida real colombiana para explicar conceptos técnicos.
- Celebras los avances genuinamente pero eres exigente con la comprensión.
- NUNCA das el código completo si el estudiante no ha intentado primero.
- Siempre preguntas "¿qué intentaste primero?" antes de ayudar con código.
- Cuando el estudiante entiende algo, refuérzalo: "¡Eso es exactamente lo que hace un arquitecto!"

CONTEXTO DEL ESTUDIANTE:
${progressCtx}
${lessonCtx}

METODOLOGÍA CRAL:
- CONSTRUIR: el estudiante debe intentar antes de recibir la solución completa.
- ROMPER: motiva a que experimenten qué pasa cuando algo falla.
- AUDITAR: cuando generes código, siempre di qué deberían revisar.
- LANZAR: recuérdales que el entregable debe existir en internet, no en local.

REGLAS ABSOLUTAS:
- Responde siempre en español colombiano, máximo 4 párrafos.
- Si el estudiante pide que hagas su entregable por él, declina y guíalo.
- Si preguntas sobre temas fuera del stack (Next.js, Prisma, Clerk, MercadoPago, Wompi, OpenAI, Claude), responde pero advierte que está fuera del bootcamp.
- Nunca inventes información sobre el temario — si no sabes algo del bootcamp, di "Consulta el temario en la plataforma".`;
  },

  async getLessonContext(lessonId: string) {
    const lesson = await prisma.academyLesson.findUnique({
      where: { id: lessonId },
      include: {
        meta: true,
        cralChallenges: { orderBy: { order: "asc" } },
        deliverables: { include: { checkItems: true } },
      },
    });
    if (!lesson) return null;

    return {
      title: lesson.title,
      analogy: lesson.meta?.analogyText,
      kaledIntro: lesson.meta?.kaledIntro,
      cralChallenges: lesson.cralChallenges,
      deliverableTitle: lesson.deliverables[0]?.title,
    };
  },
};

// ============================================================
// SERVICIO 9: BADGES Y GAMIFICACIÓN
// ============================================================

export const badgeService = {
  async checkAndAward(userId: string, tenantId: string) {
    const [snapshot, existingBadges, allBadges] = await Promise.all([
      prisma.academyStudentSnapshot.findFirst({ where: { userId, tenantId } }),
      prisma.academyBadgeEarned.findMany({
        where: { userId },
        select: { badgeId: true },
      }),
      prisma.academyBadge.findMany({ where: { tenantId, isActive: true } }),
    ]);

    if (!snapshot) return [];
    const earnedSet = new Set(existingBadges.map((b) => b.badgeId));
    const newBadges: string[] = [];

    for (const badge of allBadges) {
      if (earnedSet.has(badge.id)) continue;

      let earned = false;
      switch (badge.condition) {
        case "LESSONS_COMPLETED":
          earned = snapshot.lessonsCompleted >= (badge.threshold ?? 1);
          break;
        case "DELIVERABLES_APPROVED":
          earned = snapshot.deliverablesApproved >= (badge.threshold ?? 1);
          break;
        case "QUIZ_PERFECT_SCORE":
          earned = snapshot.quizzesPassed >= (badge.threshold ?? 1);
          break;
        case "REAL_USERS_3": {
          const project = await prisma.academySaasProject.findFirst({
            where: { userId, tenantId },
          });
          earned = (project?.realUsers ?? 0) >= 3;
          break;
        }
        case "DEMO_DAY_PASSED": {
          const demoResult = await prisma.academyDemoDayResult.findFirst({
            where: { project: { userId }, passed: true },
          });
          earned = !!demoResult;
          break;
        }
        default:
          break;
      }

      if (earned) {
        await prisma.academyBadgeEarned.create({
          data: { userId, badgeId: badge.id },
        });
        newBadges.push(badge.name);
      }
    }

    return newBadges;
  },
};

// ============================================================
// SERVICIO 10: ANALYTICS DEL INSTRUCTOR
// ============================================================

export const analyticsService = {
  async getCohortAnalytics(cohortId: string, tenantId: string) {
    const [
      totalStudents,
      activeStudents,
      avgProgress,
      deliverablesStats,
      quizStats,
      topLessons,
    ] = await Promise.all([
      prisma.academyEnrollment.count({
        where: { cohortId, status: "ACTIVE" },
      }),

      prisma.academyStudentSnapshot.count({
        where: {
          cohortId,
          lastActivityAt: { gte: new Date(Date.now() - 7 * 86400000) },
        },
      }),

      prisma.academyStudentSnapshot.aggregate({
        where: { cohortId },
        _avg: { overallProgress: true },
      }),

      prisma.academyDeliverableSubmission.groupBy({
        by: ["status"],
        where: {
          deliverable: {
            lesson: {
              module: {
                course: { cohorts: { some: { id: cohortId } } },
              },
            },
          },
        },
        _count: { status: true },
      }),

      (async () => {
        const [total, correct] = await Promise.all([
          prisma.academyQuizResult.count({
            where: {
              quiz: {
                lesson: {
                  module: {
                    course: { cohorts: { some: { id: cohortId } } },
                  },
                },
              },
            },
          }),
          prisma.academyQuizResult.count({
            where: {
              isCorrect: true,
              quiz: {
                lesson: {
                  module: {
                    course: { cohorts: { some: { id: cohortId } } },
                  },
                },
              },
            },
          }),
        ]);
        return { _count: { id: total }, correct };
      })(),

      prisma.academyStudentProgress.groupBy({
        by: ["lessonId"],
        where: {
          lesson: {
            module: {
              course: { cohorts: { some: { id: cohortId } } },
            },
          },
        },
        _avg: { timeSpentSec: true },
        _count: { lessonId: true },
        orderBy: { _avg: { timeSpentSec: "desc" } },
        take: 5,
      }),
    ]);

    return {
      totalStudents,
      activeStudents,
      avgProgress: Number(avgProgress._avg.overallProgress ?? 0).toFixed(1),
      deliverables: deliverablesStats,
      quizAccuracy:
        quizStats._count.id > 0
          ? Math.round((quizStats.correct / quizStats._count.id) * 100)
          : 0,
      topEngagedLessons: topLessons,
    };
  },
};
