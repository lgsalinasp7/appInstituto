import prisma from "@/lib/prisma";
import type {
  CreateProspectData,
  UpdateProspectData,
  ProspectFilters,
  ProspectWithRelations,
  ProspectsListResponse,
  ProspectStats,
} from "../types";
import { Prisma, ProspectStatus } from "@prisma/client";

export class ProspectService {
  static async getProspects(filters: ProspectFilters): Promise<ProspectsListResponse> {
    const { search, status, programId, advisorId, page = 1, limit = 10 } = filters;

    const where: Prisma.ProspectWhereInput = {};

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
    const prospect = await prisma.prospect.findUnique({
      where: { id },
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
    const prospect = await prisma.prospect.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        status: data.status || "CONTACTADO",
        observations: data.observations || null,
        programId: data.programId || null,
        advisorId: data.advisorId,
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
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
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
    const where: Prisma.ProspectWhereInput = advisorId ? { advisorId } : {};

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
