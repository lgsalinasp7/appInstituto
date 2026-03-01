/**
 * Servicio de cohortes de Academia LMS
 */
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CreateCohortInput } from "../schemas";

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
}
