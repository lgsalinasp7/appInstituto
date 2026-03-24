/**
 * Servicio de inscripciones de Academia LMS
 */
import { prisma } from "@/lib/prisma";
import type { CreateEnrollmentInput } from "../schemas";

export class AcademyEnrollmentService {
  static async listByUser(userId: string) {
    return prisma.academyEnrollment.findMany({
      where: { userId },
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
                },
              },
            },
          },
        },
        cohort: { select: { id: true, name: true } },
      },
    });
  }

  static async listByCourse(courseId: string, tenantId: string) {
    return prisma.academyEnrollment.findMany({
      where: { courseId, course: { tenantId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async enroll(data: CreateEnrollmentInput, tenantId: string) {
    const trialFields = async (cohortId: string | undefined) => {
      if (!cohortId) {
        return {
          isTrial: false,
          trialExpiresAt: null as Date | null,
          clearTrialLesson: true,
        };
      }
      const cohort = await prisma.academyCohort.findFirst({
        where: { id: cohortId, tenantId },
        select: { kind: true, endDate: true },
      });
      if (cohort?.kind === "PROMOTIONAL") {
        return {
          isTrial: true,
          trialExpiresAt: cohort.endDate,
          clearTrialLesson: false,
        };
      }
      return {
        isTrial: false,
        trialExpiresAt: null as Date | null,
        clearTrialLesson: true,
      };
    };

    const existing = await prisma.academyEnrollment.findUnique({
      where: {
        userId_courseId: { userId: data.userId, courseId: data.courseId },
      },
    });
    if (existing) {
      if (data.cohortId && existing.cohortId !== data.cohortId) {
        const t = await trialFields(data.cohortId);
        return prisma.academyEnrollment.update({
          where: { userId_courseId: { userId: data.userId, courseId: data.courseId } },
          data: {
            cohortId: data.cohortId,
            isTrial: t.isTrial,
            trialExpiresAt: t.trialExpiresAt,
            ...(t.clearTrialLesson ? { trialAllowedLessonId: null } : {}),
          },
        });
      }
      return existing;
    }
    const t = await trialFields(data.cohortId);
    return prisma.academyEnrollment.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        cohortId: data.cohortId ?? undefined,
        status: "ACTIVE",
        progress: 0,
        isTrial: t.isTrial,
        trialExpiresAt: t.trialExpiresAt,
        ...(t.clearTrialLesson ? { trialAllowedLessonId: null } : {}),
      },
    });
  }

  static async getEnrollment(userId: string, courseId: string) {
    return prisma.academyEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
      },
    });
  }
}
