import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import type {
  CreateProspectData,
  UpdateProspectData,
  ProspectFilters,
  ProspectWithRelations,
  ProspectsListResponse,
  ProspectStats,
} from "../types";
import { Prisma } from "@prisma/client";

export class ProspectService {
  static async getProspects(filters: ProspectFilters): Promise<ProspectsListResponse> {
    const { search, status, programId, advisorId, page = 1, limit = 10 } = filters;
    const tenantId = await getCurrentTenantId() as string;

    const where: Prisma.ProspectWhereInput = {
      tenantId
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (programId) {
      where.programId = programId;
    }

    if (advisorId) {
      where.advisorId = advisorId;
    }

    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        include: {
          program: {
            select: { id: true, name: true },
          },
          advisor: {
            select: { id: true, name: true, email: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.prospect.count({ where }),
    ]);

    const prospectsWithRelations: ProspectWithRelations[] = prospects.map((prospect) => ({
      id: prospect.id,
      name: prospect.name,
      phone: prospect.phone,
      email: prospect.email,
      status: prospect.status,
      observations: prospect.observations,
      programId: prospect.programId,
      advisorId: prospect.advisorId,
      createdAt: prospect.createdAt,
      updatedAt: prospect.updatedAt,
      program: prospect.program,
      advisor: prospect.advisor,
    }));

    return {
      prospects: prospectsWithRelations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getProspectById(id: string): Promise<ProspectWithRelations | null> {
    const tenantId = await getCurrentTenantId() as string;
    const prospect = await prisma.prospect.findFirst({
      where: { id, tenantId },
      include: {
        program: {
          select: { id: true, name: true },
        },
        advisor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!prospect) return null;

    return {
      id: prospect.id,
      name: prospect.name,
      phone: prospect.phone,
      email: prospect.email,
      status: prospect.status,
      observations: prospect.observations,
      programId: prospect.programId,
      advisorId: prospect.advisorId,
      createdAt: prospect.createdAt,
      updatedAt: prospect.updatedAt,
      program: prospect.program,
      advisor: prospect.advisor,
    };
  }

  static async createProspect(data: CreateProspectData) {
    const tenantId = await getCurrentTenantId() as string;
    const prospect = await prisma.prospect.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        status: data.status || "CONTACTADO",
        observations: data.observations || null,
        programId: data.programId || null,
        advisorId: data.advisorId,
        tenantId,
      },
      include: {
        program: {
          select: { id: true, name: true },
        },
        advisor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return prospect;
  }

  static async updateProspect(id: string, data: UpdateProspectData) {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia
    const existing = await prisma.prospect.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Prospecto no encontrado o no pertenece a este instituto");
    }

    const prospect = await prisma.prospect.update({
      where: { id },
      data: {
        ...data,
        email: data.email || null,
        programId: data.programId ?? undefined,
      },
      include: {
        program: {
          select: { id: true, name: true },
        },
        advisor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return prospect;
  }

  static async deleteProspect(id: string) {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia
    const existing = await prisma.prospect.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Prospecto no encontrado o no pertenece a este instituto");
    }

    await prisma.prospect.delete({
      where: { id },
    });
  }

  static async convertToStudent(prospectId: string, studentData: {
    documentType: string;
    documentNumber: string;
    address?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    enrollmentDate: Date;
    initialPayment: number;
    totalProgramValue: number;
  }) {
    const tenantId = await getCurrentTenantId() as string;
    const prospect = await prisma.prospect.findFirst({
      where: { id: prospectId, tenantId },
    });

    if (!prospect) {
      throw new Error("Prospecto no encontrado");
    }

    if (!prospect.programId) {
      throw new Error("El prospecto debe tener un programa asignado para convertir");
    }

    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          fullName: prospect.name,
          documentType: studentData.documentType,
          documentNumber: studentData.documentNumber,
          email: prospect.email,
          phone: prospect.phone,
          address: studentData.address || null,
          guardianName: studentData.guardianName || null,
          guardianPhone: studentData.guardianPhone || null,
          guardianEmail: studentData.guardianEmail || null,
          enrollmentDate: studentData.enrollmentDate,
          initialPayment: studentData.initialPayment,
          totalProgramValue: studentData.totalProgramValue,
          status: "MATRICULADO",
          programId: prospect.programId!,
          advisorId: prospect.advisorId,
          tenantId,
        },
      });

      await tx.prospect.update({
        where: { id: prospectId },
        data: { status: "CERRADO" },
      });

      return newStudent;
    });

    return student;
  }

  static async getStats(advisorId?: string): Promise<ProspectStats> {
    const tenantId = await getCurrentTenantId() as string;
    const where: Prisma.ProspectWhereInput = {
      tenantId,
      ...(advisorId && { advisorId })
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, byStatus, thisMonth] = await Promise.all([
      prisma.prospect.count({ where }),
      prisma.prospect.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      prisma.prospect.count({
        where: {
          ...where,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    const closedCount = byStatus.find((s) => s.status === "CERRADO")?._count || 0;
    const conversionRate = total > 0 ? (closedCount / total) * 100 : 0;

    return {
      total,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      conversionRate: Math.round(conversionRate * 100) / 100,
      thisMonth,
    };
  }
}
