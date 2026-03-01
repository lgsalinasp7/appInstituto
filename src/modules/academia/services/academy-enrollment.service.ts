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
    const existing = await prisma.academyEnrollment.findUnique({
      where: {
        userId_courseId: { userId: data.userId, courseId: data.courseId },
      },
    });
    if (existing) {
      return existing;
    }
    return prisma.academyEnrollment.create({
      data: {
        ...data,
        status: "ACTIVE",
        progress: 0,
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
