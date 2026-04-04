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

/**
 * Varios registros `AcademyModule` con el mismo `order` (p. ej. seed duplicado) provocaban
 * secciones repetidas "Módulo 1" en admin y lecciones huérfanas en la vista estudiante.
 * Fusiona por `order`: une títulos y deduplica lecciones por `id`.
 */
function mergeAcademyModulesByOrder<
  TModule extends {
    id: string;
    title: string;
    order: number;
    lessons: TLesson[];
  },
  TLesson extends { id: string; order: number },
>(modules: TModule[]): TModule[] {
  const sorted = [...modules].sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id)
  );
  type Acc = { headId: string; titles: string[]; lessonMap: Map<string, TLesson> };
  const byOrder = new Map<number, Acc>();

  for (const mod of sorted) {
    let acc = byOrder.get(mod.order);
    if (!acc) {
      acc = { headId: mod.id, titles: [mod.title], lessonMap: new Map() };
      byOrder.set(mod.order, acc);
    } else if (!acc.titles.includes(mod.title)) {
      acc.titles.push(mod.title);
    }
    for (const l of mod.lessons) {
      if (!acc.lessonMap.has(l.id)) {
        acc.lessonMap.set(l.id, l);
      }
    }
  }

  return Array.from(byOrder.entries())
    .sort(([a], [b]) => a - b)
    .map(([order, acc]) => {
      const template = sorted.find((m) => m.id === acc.headId)!;
      const mergedTitle =
        acc.titles.length > 1 ? acc.titles.join(" · ") : acc.titles[0] ?? template.title;
      const mergedLessons = Array.from(acc.lessonMap.values()).sort(
        (x, y) => x.order - y.order || x.id.localeCompare(y.id)
      ) as TModule["lessons"];
      return {
        ...template,
        id: acc.headId,
        title: mergedTitle,
        order,
        lessons: mergedLessons,
      };
    });
}

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

    const mergedModules = mergeAcademyModulesByOrder(cohort.course.modules);

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
      modules: mergedModules.map((mod) => ({
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

    const lessonIds = mergedModules.flatMap((m) => m.lessons.map((l) => l.id));
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
      include: {
        lesson: { select: { id: true, title: true } },
        deliveredBy: { select: { id: true, name: true } },
      },
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
    const modules = mergeAcademyModulesByOrder(cohort.course.modules);
    return {
      cohortId: cohort.id,
      cohortName: cohort.name,
      courseTitle: cohort.course.title,
      lessonGatingEnabled: cohort.lessonGatingEnabled,
      timezone: cohort.timezone,
      releasedLessonIds: releases.map((r) => r.lessonId),
      modules,
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
    // Al cancelar un evento que tiene constancia, limpiar deliveredAt/deliveredByUserId
    if (data.cancelled === true && existing.deliveredAt) {
      data.deliveredAt = null;
      data.deliveredBy = { disconnect: true };
    }
    return prisma.academyCohortEvent.update({
      where: { id: eventId },
      data,
    });
  }

  /**
   * Marcar o revertir constancia de sesión impartida.
   * RBAC: ADMIN puede marcar/revertir, TEACHER solo marcar (si asignado).
   */
  static async markEventDelivered(
    eventId: string,
    cohortId: string,
    tenantId: string,
    userId: string,
    delivered: boolean,
    userRole: string
  ) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) return { error: "Cohorte no encontrado", status: 404 };

    const event = await prisma.academyCohortEvent.findFirst({
      where: { id: eventId, cohortId },
    });
    if (!event) return { error: "Evento no encontrado", status: 404 };

    if (event.cancelled) {
      return { error: "No se puede marcar un evento cancelado", status: 400 };
    }
    if (!event.lessonId) {
      return { error: "No se puede marcar un evento sin lección vinculada", status: 400 };
    }

    if (userRole === "ACADEMY_TEACHER") {
      if (!delivered) {
        return { error: "El profesor no puede revertir la constancia", status: 400 };
      }
      const assigned = await prisma.academyCohortTeacherAssignment.findFirst({
        where: { cohortId, teacherId: userId },
      });
      if (!assigned) {
        return { error: "No está asignado a este cohorte", status: 400 };
      }
    }

    const updated = await prisma.academyCohortEvent.update({
      where: { id: eventId },
      data: {
        deliveredAt: delivered ? new Date() : null,
        deliveredByUserId: delivered ? userId : null,
      },
    });
    return { data: updated };
  }

  /**
   * Expandir un patrón recurrente (dayOfWeek) a eventos individuales con scheduledAt.
   */
  static async expandRecurringPattern(
    cohortId: string,
    tenantId: string,
    input: {
      title: string;
      type: string;
      dayOfWeek: number;
      startTime: string;
      endTime?: string | null;
      lessonId?: string | null;
      rangeStart?: Date;
      rangeEnd?: Date;
    }
  ) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
      select: { id: true, startDate: true, endDate: true, timezone: true },
    });
    if (!cohort) return null;

    const start = input.rangeStart ?? cohort.startDate;
    const end = input.rangeEnd ?? cohort.endDate;
    const dates: Date[] = [];
    const cursor = new Date(start);
    // Avanzar al primer día que coincida con dayOfWeek
    while (cursor <= end) {
      if (cursor.getDay() === input.dayOfWeek) {
        const [hh, mm] = input.startTime.split(":").map(Number);
        const dt = new Date(cursor);
        dt.setHours(hh, mm, 0, 0);
        dates.push(dt);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (dates.length === 0) return { count: 0 };

    // Obtener max sessionOrder existente
    const maxOrder = await prisma.academyCohortEvent.aggregate({
      where: { cohortId },
      _max: { sessionOrder: true },
    });
    let nextOrder = (maxOrder._max.sessionOrder ?? -1) + 1;

    await prisma.academyCohortEvent.createMany({
      data: dates.map((d) => ({
        cohortId,
        title: input.title,
        type: input.type,
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        scheduledAt: d,
        lessonId: input.lessonId ?? null,
        sessionOrder: nextOrder++,
      })),
    });

    return { count: dates.length };
  }

  /**
   * Eventos para el calendario admin/teacher.
   * Filtros opcionales: courseId, cohortId, teacherUserId (auto para teacher).
   */
  static async listEventsForCalendar(
    tenantId: string,
    filters: { courseId?: string; cohortId?: string; teacherUserId?: string }
  ) {
    const cohortWhere: Prisma.AcademyCohortWhereInput = {
      tenantId,
      kind: { not: "PROMOTIONAL" },
    };
    if (filters.courseId) cohortWhere.courseId = filters.courseId;
    if (filters.cohortId) cohortWhere.id = filters.cohortId;
    if (filters.teacherUserId) {
      cohortWhere.teacherAssignments = {
        some: { teacherId: filters.teacherUserId },
      };
    }

    const cohorts = await prisma.academyCohort.findMany({
      where: cohortWhere,
      select: { id: true, name: true, course: { select: { id: true, title: true } } },
    });
    if (cohorts.length === 0) return [];

    const cohortIds = cohorts.map((c) => c.id);
    const cohortMap = new Map(cohorts.map((c) => [c.id, c]));

    const events = await prisma.academyCohortEvent.findMany({
      where: { cohortId: { in: cohortIds } },
      include: {
        lesson: { select: { id: true, title: true } },
        deliveredBy: { select: { id: true, name: true } },
      },
      orderBy: [{ scheduledAt: "asc" }, { sessionOrder: "asc" }],
    });

    return events.map((e) => {
      const c = cohortMap.get(e.cohortId);
      return {
        id: e.id,
        cohortId: e.cohortId,
        cohortName: c?.name ?? "",
        courseId: c?.course.id ?? "",
        courseTitle: c?.course.title ?? "",
        title: e.title,
        type: e.type,
        scheduledAt: e.scheduledAt?.toISOString() ?? null,
        startTime: e.startTime,
        endTime: e.endTime,
        lessonId: e.lessonId,
        lessonTitle: e.lesson?.title ?? null,
        sessionOrder: e.sessionOrder,
        cancelled: e.cancelled,
        deliveredAt: e.deliveredAt?.toISOString() ?? null,
        deliveredByName: e.deliveredBy?.name ?? null,
      };
    });
  }

  /**
   * Eventos para el calendario del estudiante.
   * Solo cohortes con enrollment ACTIVE + kind ACADEMIC.
   */
  static async listEventsForStudentCalendar(userId: string, tenantId: string) {
    const enrollments = await prisma.academyEnrollment.findMany({
      where: {
        userId,
        status: "ACTIVE",
        cohortId: { not: null },
        course: { tenantId },
      },
      select: { cohortId: true },
    });
    const cohortIds = [...new Set(enrollments.map((e) => e.cohortId!))];
    if (cohortIds.length === 0) return { events: [], releasedByCohort: {} };

    const cohorts = await prisma.academyCohort.findMany({
      where: { id: { in: cohortIds }, kind: "ACADEMIC" },
      select: { id: true, name: true, course: { select: { id: true, title: true } } },
    });
    const filteredIds = cohorts.map((c) => c.id);
    if (filteredIds.length === 0) return { events: [], releasedByCohort: {} };

    const cohortMap = new Map(cohorts.map((c) => [c.id, c]));

    const [events, releases] = await Promise.all([
      prisma.academyCohortEvent.findMany({
        where: { cohortId: { in: filteredIds } },
        include: {
          lesson: { select: { id: true, title: true } },
        },
        orderBy: [{ scheduledAt: "asc" }, { sessionOrder: "asc" }],
      }),
      prisma.academyCohortLessonRelease.findMany({
        where: { cohortId: { in: filteredIds } },
        select: { cohortId: true, lessonId: true },
      }),
    ]);

    const releasedByCohort: Record<string, string[]> = {};
    for (const r of releases) {
      if (!releasedByCohort[r.cohortId]) releasedByCohort[r.cohortId] = [];
      releasedByCohort[r.cohortId].push(r.lessonId);
    }

    return {
      events: events.map((e) => {
        const c = cohortMap.get(e.cohortId);
        return {
          id: e.id,
          cohortId: e.cohortId,
          cohortName: c?.name ?? "",
          courseTitle: c?.course.title ?? "",
          title: e.title,
          type: e.type,
          scheduledAt: e.scheduledAt?.toISOString() ?? null,
          startTime: e.startTime,
          lessonId: e.lessonId,
          lessonTitle: e.lesson?.title ?? null,
          cancelled: e.cancelled,
          deliveredAt: e.deliveredAt?.toISOString() ?? null,
        };
      }),
      releasedByCohort,
    };
  }
}
