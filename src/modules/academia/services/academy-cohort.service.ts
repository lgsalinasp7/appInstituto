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
                lessons: { orderBy: { order: "asc" } },
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
