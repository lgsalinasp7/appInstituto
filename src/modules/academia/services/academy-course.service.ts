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
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { order: "asc" },
            },
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
}
