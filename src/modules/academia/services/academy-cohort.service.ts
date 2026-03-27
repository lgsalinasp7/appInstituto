/**
 * Servicio de cohortes de Academia LMS
 */
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CreateCohortInput, CreateCohortEventInput, CreateAssessmentInput } from "../schemas";
import {
  AcademyCohortLessonAccessService,
  isLessonPrecohortMeta,
} from "./academy-cohort-lesson-access.service";

export class AcademyCohortService {
  static async listByTenant(tenantId: string) {
    return prisma.academyCohort.findMany({
      where: { tenantId },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  /** Cohortes donde el estudiante tiene matrícula activa con cohorte asignado. */
  static async listForStudent(userId: string, tenantId: string) {
    const enrollments = await prisma.academyEnrollment.findMany({
      where: {
        userId,
        status: "ACTIVE",
        cohortId: { not: null },
        course: { tenantId },
      },
      select: { cohortId: true },
    });
    const ids = [...new Set(enrollments.map((e) => e.cohortId!))];
    if (ids.length === 0) return [];
    return prisma.academyCohort.findMany({
      where: { tenantId, id: { in: ids } },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  /** Cohortes asignados al profesor (vacío si ninguno). */
  static async listForTeacher(teacherUserId: string, tenantId: string) {
    const { AcademyCohortLifecycleService } = await import(
      "./academy-cohort-lifecycle.service"
    );
    const cohortIds = await AcademyCohortLifecycleService.listCohortIdsForTeacher(
      teacherUserId,
      tenantId
    );
    if (cohortIds.length === 0) return [];
    return prisma.academyCohort.findMany({
      where: { tenantId, id: { in: cohortIds } },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  static async create(tenantId: string, data: CreateCohortInput) {
    const { schedule, kind, promoPreset, campaignLabel, ...rest } = data;
    return prisma.academyCohort.create({
      data: {
        tenantId,
        ...rest,
        kind: kind ?? "ACADEMIC",
        promoPreset: promoPreset ?? null,
        campaignLabel: campaignLabel ?? null,
        schedule: schedule as Prisma.InputJsonValue,
      },
    });
  }

  static async getById(id: string, tenantId: string) {
    return prisma.academyCohort.findFirst({
      where: { id, tenantId },
      include: { course: true },
    });
  }

  static async getByIdForStudent(id: string, tenantId: string) {
    return prisma.academyCohort.findFirst({
      where: { id, tenantId },
      include: {
        course: {
          include: {
            modules: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  where: { isActive: true },
                  orderBy: { order: "asc" },
                  include: {
                    meta: { select: { weekNumber: true, dayOfWeek: true, isPrecohort: true } },
                  },
                },
              },
            },
          },
        },
        events: { orderBy: { scheduledAt: "asc" } },
        assessments: { orderBy: { scheduledAt: "asc" } },
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });
  }

  /** Obtiene datos del cohorte para vista de estudiante (server-side). */
  static async getCohortDataForStudent(
    userId: string,
    cohortId: string,
    userPlatformRole: string,
    tenantId: string
  ) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
      include: {
        course: {
          include: {
            modules: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  where: { isActive: true },
                  orderBy: { order: "asc" },
                  include: {
                    meta: { select: { weekNumber: true, dayOfWeek: true, isPrecohort: true } },
                  },
                },
              },
            },
          },
        },
        events: { orderBy: { scheduledAt: "asc" } },
        assessments: { orderBy: { scheduledAt: "asc" } },
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!cohort) return null;

    const enrollment = await prisma.academyEnrollment.findFirst({
      where: {
        userId,
        courseId: cohort.courseId,
        status: "ACTIVE",
      },
      select: {
        isTrial: true,
        trialAllowedLessonId: true,
        trialExpiresAt: true,
        cohortId: true,
      },
    });

    if (userPlatformRole === "ACADEMY_STUDENT") {
      if (!enrollment?.cohortId || enrollment.cohortId !== cohortId) {
        return null;
      }
    } else if (userPlatformRole === "ACADEMY_TEACHER") {
      const assigned = await prisma.academyCohortTeacherAssignment.findFirst({
        where: { cohortId, teacherId: userId },
      });
      if (!assigned) return null;
    } else if (userPlatformRole !== "ACADEMY_ADMIN") {
      return null;
    }

    // Deduplicar módulos por id y order (evita duplicados en la vista)
    const rawModules = cohort.course.modules;
    const seenIds = new Set<string>();
    const seenOrders = new Set<number>();
    const uniqueModules = rawModules
      .filter((mod) => {
        if (seenIds.has(mod.id)) return false;
        if (seenOrders.has(mod.order)) return false;
        seenIds.add(mod.id);
        seenOrders.add(mod.order);
        return true;
      })
      .sort((a, b) => a.order - b.order);

    const releasedSet = cohort.lessonGatingEnabled
      ? await AcademyCohortLessonAccessService.getReleasedLessonIds(cohort.id)
      : new Set<string>();

    const trialExpired = Boolean(
      enrollment?.isTrial &&
        enrollment.trialExpiresAt &&
        new Date() > enrollment.trialExpiresAt
    );

    const courseWithUniqueModules = {
      ...cohort.course,
      modules: uniqueModules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((l) => ({
          ...l,
          isLocked: AcademyCohortLessonAccessService.computeLessonLockedForStudentView({
            platformRole: userPlatformRole,
            lessonGatingEnabled: cohort.lessonGatingEnabled,
            releasedLessonIds: releasedSet,
            isPrecohort: isLessonPrecohortMeta(l.meta ?? undefined),
            isTrial: enrollment?.isTrial ?? false,
            trialExpired,
            trialAllowedLessonId: enrollment?.trialAllowedLessonId ?? null,
            lessonId: l.id,
            enrollmentCohortId: enrollment?.cohortId ?? null,
          }),
        })),
      })),
    };

    const lessonIds = uniqueModules.flatMap((m) => m.lessons.map((l) => l.id));
    const progressRecords = await prisma.academyStudentProgress.findMany({
      where: { userId, lessonId: { in: lessonIds }, completed: true },
      select: { lessonId: true },
    });
    const completedLessonIds = progressRecords.map((r) => r.lessonId);

    return {
      cohort: {
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate.toISOString(),
        endDate: cohort.endDate.toISOString(),
        status: cohort.status,
        courseId: cohort.courseId,
        lessonGatingEnabled: cohort.lessonGatingEnabled,
        timezone: cohort.timezone,
      },
      course: courseWithUniqueModules,
      events: cohort.events.map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        dayOfWeek: e.dayOfWeek,
        startTime: e.startTime,
        endTime: e.endTime,
        scheduledAt: e.scheduledAt?.toISOString?.() ?? "",
        lessonId: e.lessonId,
        sessionOrder: e.sessionOrder,
        cancelled: e.cancelled,
      })),
      assessments: cohort.assessments.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        scheduledAt: a.scheduledAt?.toISOString?.() ?? "",
      })),
      members: cohort.enrollments.map((e) => ({
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        image: e.user.image,
      })),
      completedLessonIds,
      isTrial: enrollment?.isTrial ?? false,
      trialAllowedLessonId: enrollment?.trialAllowedLessonId ?? null,
    };
  }

  static async update(
    id: string,
    tenantId: string,
    data: Partial<Omit<CreateCohortInput, "courseId">>
  ) {
    const { schedule, ...rest } = data;
    const updateData =
      schedule !== undefined
        ? { ...rest, schedule: schedule as Prisma.InputJsonValue }
        : rest;
    return prisma.academyCohort.updateMany({
      where: { id, tenantId },
      data: updateData,
    });
  }

  static async delete(id: string, tenantId: string) {
    const count = await prisma.academyEnrollment.count({
      where: { cohortId: id },
    });
    if (count > 0) {
      throw new Error(
        "No se puede eliminar el cohorte mientras tenga estudiantes matriculados"
      );
    }
    return prisma.academyCohort.deleteMany({ where: { id, tenantId } });
  }

  static async listEvents(cohortId: string, tenantId: string) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) return null;
    return prisma.academyCohortEvent.findMany({
      where: { cohortId },
      orderBy: [{ sessionOrder: "asc" }, { scheduledAt: "asc" }, { dayOfWeek: "asc" }],
    });
  }

  static async createEvent(cohortId: string, tenantId: string, data: CreateCohortEventInput) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) return null;
    return prisma.academyCohortEvent.create({
      data: { cohortId, ...data },
    });
  }

  static async listAssessments(cohortId: string, tenantId: string) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) return null;
    return prisma.academyAssessment.findMany({
      where: { cohortId },
      orderBy: { scheduledAt: "asc" },
    });
  }

  static async createAssessment(cohortId: string, tenantId: string, data: CreateAssessmentInput) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) return null;
    return prisma.academyAssessment.create({
      data: { cohortId, ...data },
    });
  }

  static async listMembers(cohortId: string, tenantId: string) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
      include: {
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });
    if (!cohort) return null;
    return cohort.enrollments.map((e) => ({
      id: e.user.id,
      name: e.user.name,
      email: e.user.email,
      image: e.user.image,
    }));
  }

  /** Estado de gating + lista plana de lecciones para editor admin / lectura profesor. */
  static async getLessonAccessEditorState(cohortId: string, tenantId: string) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
      include: {
        course: {
          include: {
            modules: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  where: { isActive: true },
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    title: true,
                    order: true,
                    meta: { select: { weekNumber: true, dayOfWeek: true, isPrecohort: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!cohort) return null;
    const releases = await prisma.academyCohortLessonRelease.findMany({
      where: { cohortId },
      select: { lessonId: true },
    });
    return {
      cohortId: cohort.id,
      lessonGatingEnabled: cohort.lessonGatingEnabled,
      timezone: cohort.timezone,
      releasedLessonIds: releases.map((r) => r.lessonId),
      modules: cohort.course.modules,
    };
  }

  static async setLessonReleases(
    cohortId: string,
    tenantId: string,
    adminUserId: string,
    data: { lessonGatingEnabled?: boolean; releasedLessonIds?: string[] }
  ) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
      select: { id: true, courseId: true },
    });
    if (!cohort) {
      throw new Error("Cohorte no encontrado");
    }

    if (data.releasedLessonIds !== undefined && data.releasedLessonIds.length > 0) {
      const valid = await prisma.academyLesson.count({
        where: {
          id: { in: data.releasedLessonIds },
          module: { courseId: cohort.courseId },
        },
      });
      if (valid !== data.releasedLessonIds.length) {
        throw new Error("Alguna lección no pertenece al curso de este cohorte");
      }
    }

    await prisma.$transaction(async (tx) => {
      if (data.lessonGatingEnabled !== undefined) {
        await tx.academyCohort.update({
          where: { id: cohortId },
          data: { lessonGatingEnabled: data.lessonGatingEnabled },
        });
      }
      if (data.releasedLessonIds !== undefined) {
        await tx.academyCohortLessonRelease.deleteMany({ where: { cohortId } });
        if (data.releasedLessonIds.length > 0) {
          await tx.academyCohortLessonRelease.createMany({
            data: data.releasedLessonIds.map((lessonId) => ({
              cohortId,
              lessonId,
              releasedByUserId: adminUserId,
            })),
          });
        }
      }
    });
  }

  static async updateEvent(
    eventId: string,
    cohortId: string,
    tenantId: string,
    data: Prisma.AcademyCohortEventUpdateInput
  ) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) return null;
    const existing = await prisma.academyCohortEvent.findFirst({
      where: { id: eventId, cohortId },
    });
    if (!existing) return null;
    return prisma.academyCohortEvent.update({
      where: { id: eventId },
      data,
    });
  }
}
