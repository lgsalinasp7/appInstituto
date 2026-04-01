/**
 * Servicio de cursos de Academia LMS
 */
import type { CRALPhase, DayOfWeek, SessionType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateCourseInput, CreateModuleInput, CreateLessonInput } from "../schemas";

export class AcademyCourseService {
  static async listByTenant(tenantId: string) {
    return prisma.academyCourse.findMany({
      where: { tenantId, isActive: true },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string, tenantId: string) {
    return prisma.academyCourse.findFirst({
      where: { id, tenantId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
        cohorts: {
          orderBy: { startDate: "desc" },
          include: {
            _count: { select: { enrollments: true } },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async create(tenantId: string, createdById: string, data: CreateCourseInput) {
    return prisma.academyCourse.create({
      data: {
        tenantId,
        createdById,
        ...data,
      },
    });
  }

  static async update(id: string, tenantId: string, data: Partial<CreateCourseInput>) {
    return prisma.academyCourse.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  static async createModule(data: CreateModuleInput) {
    return prisma.academyModule.create({ data });
  }

  static async createLesson(data: CreateLessonInput) {
    return prisma.academyLesson.create({
      data: {
        ...data,
        videoUrl: data.videoUrl || undefined,
      },
    });
  }

  static async updateModule(id: string, data: { title?: string; description?: string; order?: number }) {
    return prisma.academyModule.update({
      where: { id },
      data,
    });
  }

  static async deleteModule(id: string) {
    return prisma.academyModule.delete({ where: { id } });
  }

  static async updateLesson(
    id: string,
    tenantId: string,
    data: { title?: string; description?: string; content?: string; videoUrl?: string; duration?: number; order?: number }
  ) {
    const row = await prisma.academyLesson.findFirst({
      where: { id, module: { course: { tenantId } } },
      select: { id: true },
    });
    if (!row) throw new Error("Lección no encontrada");
    return prisma.academyLesson.update({
      where: { id },
      data: {
        ...data,
        videoUrl: data.videoUrl === "" ? null : data.videoUrl,
        description: data.description === "" ? null : data.description,
      },
    });
  }

  static async deleteLesson(id: string, tenantId: string) {
    const row = await prisma.academyLesson.findFirst({
      where: { id, module: { course: { tenantId } } },
      select: { id: true },
    });
    if (!row) throw new Error("Lección no encontrada");
    return prisma.academyLesson.delete({ where: { id } });
  }

  static async upsertLessonMeta(
    lessonId: string,
    tenantId: string,
    data: {
      sessionType?: SessionType;
      weekNumber?: number;
      dayOfWeek?: DayOfWeek;
      isPrecohort?: boolean;
      phaseTarget?: CRALPhase | null;
      videoUrl?: string | null;
      videoTitle?: string | null;
      analogyText?: string | null;
      kaledIntro?: string | null;
      concepts?: Prisma.InputJsonValue | null;
      interactiveAnimationId?: string | null;
    }
  ) {
    const lesson = await prisma.academyLesson.findFirst({
      where: { id: lessonId, module: { course: { tenantId } } },
      include: { meta: true, module: { include: { course: { select: { tenantId: true } } } } },
    });
    if (!lesson) throw new Error("Lección no encontrada");
    const tId = lesson.module.course.tenantId;

    if (data.interactiveAnimationId) {
      const anim = await prisma.academyInteractiveAnimation.findFirst({
        where: { id: data.interactiveAnimationId, tenantId: tId },
      });
      if (!anim) throw new Error("Animación no válida");
    }

    const emptyToNull = (s: string | null | undefined) =>
      s === "" || s === undefined ? null : s;

    const updatePatch: Prisma.AcademyLessonMetaUpdateInput = {};
    if (data.sessionType !== undefined) updatePatch.sessionType = data.sessionType;
    if (data.weekNumber !== undefined) updatePatch.weekNumber = data.weekNumber;
    if (data.dayOfWeek !== undefined) updatePatch.dayOfWeek = data.dayOfWeek;
    if (data.isPrecohort !== undefined) updatePatch.isPrecohort = data.isPrecohort;
    if (data.phaseTarget !== undefined) updatePatch.phaseTarget = data.phaseTarget;
    if (data.videoUrl !== undefined) updatePatch.videoUrl = emptyToNull(data.videoUrl);
    if (data.videoTitle !== undefined) updatePatch.videoTitle = emptyToNull(data.videoTitle);
    if (data.analogyText !== undefined) updatePatch.analogyText = emptyToNull(data.analogyText);
    if (data.kaledIntro !== undefined) updatePatch.kaledIntro = emptyToNull(data.kaledIntro);
    if (data.concepts !== undefined) {
      updatePatch.concepts =
        data.concepts === null ? Prisma.DbNull : (data.concepts as Prisma.InputJsonValue);
    }
    if (data.interactiveAnimationId !== undefined) {
      updatePatch.interactiveAnimation =
        data.interactiveAnimationId === null
          ? { disconnect: true }
          : { connect: { id: data.interactiveAnimationId } };
    }

    if (lesson.meta) {
      return prisma.academyLessonMeta.update({
        where: { lessonId },
        data: updatePatch,
      });
    }

    return prisma.academyLessonMeta.create({
      data: {
        lessonId,
        tenantId: tId,
        sessionType: data.sessionType ?? "TEORIA",
        weekNumber: data.weekNumber ?? 1,
        dayOfWeek: data.dayOfWeek ?? "LUNES",
        isPrecohort: data.isPrecohort ?? false,
        phaseTarget: data.phaseTarget ?? null,
        videoUrl: emptyToNull(data.videoUrl ?? null),
        videoTitle: emptyToNull(data.videoTitle ?? null),
        analogyText: emptyToNull(data.analogyText ?? null),
        kaledIntro: emptyToNull(data.kaledIntro ?? null),
        concepts:
          data.concepts === undefined || data.concepts === null
            ? undefined
            : (data.concepts as Prisma.InputJsonValue),
        interactiveAnimationId: data.interactiveAnimationId ?? null,
      },
    });
  }

  static async listInteractiveAnimations(tenantId: string) {
    return prisma.academyInteractiveAnimation.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, slug: true, title: true, description: true },
    });
  }

  static async replaceLessonQuizzes(
    lessonId: string,
    tenantId: string,
    quizzes: Array<{
      question: string;
      order: number;
      options: Array<{
        label: string;
        text: string;
        isCorrect: boolean;
        feedback?: string | null;
      }>;
    }>
  ) {
    const lesson = await prisma.academyLesson.findFirst({
      where: { id: lessonId, module: { course: { tenantId } } },
      include: { module: { include: { course: { select: { tenantId: true } } } } },
    });
    if (!lesson) throw new Error("Lección no encontrada");
    const tId = lesson.module.course.tenantId;

    await prisma.$transaction(async (tx) => {
      await tx.academyQuiz.deleteMany({ where: { lessonId, tenantId: tId } });
      for (let i = 0; i < quizzes.length; i++) {
        const q = quizzes[i];
        await tx.academyQuiz.create({
          data: {
            lessonId,
            tenantId: tId,
            question: q.question,
            order: q.order ?? i,
            options: {
              create: q.options.map((o) => ({
                label: o.label,
                text: o.text,
                isCorrect: o.isCorrect,
                feedback: o.feedback === undefined || o.feedback === "" ? null : o.feedback,
              })),
            },
          },
        });
      }
    });
  }

  static async replaceLessonCralChallenges(
    lessonId: string,
    tenantId: string,
    challenges: Array<{
      phase: CRALPhase;
      title: string;
      description: string;
      taskCode?: string | null;
      order: number;
    }>
  ) {
    const lesson = await prisma.academyLesson.findFirst({
      where: { id: lessonId, module: { course: { tenantId } } },
      include: { module: { include: { course: { select: { tenantId: true } } } } },
    });
    if (!lesson) throw new Error("Lección no encontrada");
    const tId = lesson.module.course.tenantId;

    await prisma.$transaction(async (tx) => {
      await tx.academyCRALChallenge.deleteMany({ where: { lessonId, tenantId: tId } });
      for (let i = 0; i < challenges.length; i++) {
        const c = challenges[i];
        await tx.academyCRALChallenge.create({
          data: {
            lessonId,
            tenantId: tId,
            phase: c.phase,
            title: c.title,
            description: c.description,
            taskCode: c.taskCode === undefined || c.taskCode === "" ? null : c.taskCode,
            order: c.order ?? i,
          },
        });
      }
    });
  }

  static async replaceLessonDeliverables(
    lessonId: string,
    tenantId: string,
    deliverables: Array<{
      weekNumber: number;
      title: string;
      description: string;
      isFinal: boolean;
      checkItems: Array<{ text: string; order: number }>;
    }>
  ) {
    const lesson = await prisma.academyLesson.findFirst({
      where: { id: lessonId, module: { course: { tenantId } } },
      include: { module: { include: { course: { select: { tenantId: true } } } } },
    });
    if (!lesson) throw new Error("Lección no encontrada");
    const tId = lesson.module.course.tenantId;

    await prisma.$transaction(async (tx) => {
      await tx.academyDeliverable.deleteMany({ where: { lessonId, tenantId: tId } });
      for (const d of deliverables) {
        await tx.academyDeliverable.create({
          data: {
            lessonId,
            tenantId: tId,
            weekNumber: d.weekNumber,
            title: d.title,
            description: d.description,
            isFinal: d.isFinal,
            checkItems: {
              create: d.checkItems.map((item, idx) => ({
                text: item.text,
                order: item.order ?? idx,
              })),
            },
          },
        });
      }
    });
  }
}
