/**
 * Servicio de cursos de Academia LMS
 */
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
    data: { title?: string; description?: string; content?: string; videoUrl?: string; duration?: number; order?: number }
  ) {
    return prisma.academyLesson.update({
      where: { id },
      data: { ...data, videoUrl: data.videoUrl === "" ? null : data.videoUrl },
    });
  }

  static async deleteLesson(id: string) {
    return prisma.academyLesson.delete({ where: { id } });
  }
}
