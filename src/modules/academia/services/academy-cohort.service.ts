/**
 * Servicio de cohortes de Academia LMS
 */
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CreateCohortInput, CreateCohortEventInput, CreateAssessmentInput } from "../schemas";

export class AcademyCohortService {
  static async listByTenant(tenantId: string) {
    return prisma.academyCohort.findMany({
      where: { tenantId },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { startDate: "desc" },
    });
  }

  static async create(tenantId: string, data: CreateCohortInput) {
    const { schedule, ...rest } = data;
    return prisma.academyCohort.create({
      data: {
        tenantId,
        ...rest,
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
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  include: { meta: { select: { weekNumber: true, dayOfWeek: true } } },
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
  static async getCohortDataForStudent(userId: string, cohortId: string, userPlatformRole: string) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  include: { meta: { select: { weekNumber: true, dayOfWeek: true } } },
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
    });

    const hasAccess =
      !!enrollment ||
      userPlatformRole === "ACADEMY_ADMIN" ||
      userPlatformRole === "ACADEMY_TEACHER";

    if (!hasAccess) return null;

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

    const courseWithUniqueModules = {
      ...cohort.course,
      modules: uniqueModules,
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
    return prisma.academyCohort.deleteMany({ where: { id, tenantId } });
  }

  static async listEvents(cohortId: string, tenantId: string) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) return null;
    return prisma.academyCohortEvent.findMany({
      where: { cohortId },
      orderBy: [{ scheduledAt: "asc" }, { dayOfWeek: "asc" }],
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
}
