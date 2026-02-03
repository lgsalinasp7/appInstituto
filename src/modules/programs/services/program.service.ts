import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import type { CreateProgramData, UpdateProgramData, Program, ProgramsListResponse } from "../types";

export class ProgramService {
  static async getPrograms(includeInactive = false): Promise<ProgramsListResponse> {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return { programs: [], total: 0 };
    }
    const where = includeInactive ? { tenantId } : { isActive: true, tenantId };

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        include: {
          _count: {
            select: {
              students: true,
              prospects: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.program.count({ where }),
    ]);

    const programsList: Program[] = programs.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      totalValue: Number(p.totalValue),
      matriculaValue: Number(p.matriculaValue),
      modulesCount: p.modulesCount,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      _count: p._count,
    }));

    return { programs: programsList, total };
  }

  static async getProgramById(id: string): Promise<Program | null> {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) return null;
    const program = await prisma.program.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            students: true,
            prospects: true,
          },
        },
      },
    });

    if (!program) return null;

    return {
      id: program.id,
      name: program.name,
      description: program.description,
      totalValue: Number(program.totalValue),
      matriculaValue: Number(program.matriculaValue),
      modulesCount: program.modulesCount,
      isActive: program.isActive,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      _count: program._count,
    };
  }

  static async createProgram(data: CreateProgramData): Promise<Program> {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      throw new Error("No se puede crear programa: No hay institución seleccionada. Accede desde un subdominio válido.");
    }
    const existing = await prisma.program.findFirst({
      where: { name: data.name, tenantId },
    });

    if (existing) {
      throw new Error("Ya existe un programa con este nombre");
    }

    const program = await prisma.program.create({
      data: {
        name: data.name,
        description: data.description || null,
        totalValue: data.totalValue,
        matriculaValue: data.matriculaValue,
        modulesCount: data.modulesCount,
        isActive: data.isActive ?? true,
        tenantId,
      },
    });

    return {
      id: program.id,
      name: program.name,
      description: program.description,
      totalValue: Number(program.totalValue),
      matriculaValue: Number(program.matriculaValue),
      modulesCount: program.modulesCount,
      isActive: program.isActive,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    };
  }

  static async updateProgram(id: string, data: UpdateProgramData): Promise<Program> {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      throw new Error("No se puede actualizar programa: No hay institución seleccionada.");
    }

    // Verificar pertenencia al tenant
    const existingProgram = await prisma.program.findFirst({
      where: { id, tenantId }
    });

    if (!existingProgram) {
      throw new Error("Programa no encontrado o no pertenece a este instituto");
    }

    if (data.name) {
      const existing = await prisma.program.findFirst({
        where: {
          name: data.name,
          tenantId,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error("Ya existe un programa con este nombre");
      }
    }

    const program = await prisma.program.update({
      where: { id },
      data: {
        ...data,
        description: data.description ?? undefined,
      },
    });

    return {
      id: program.id,
      name: program.name,
      description: program.description,
      totalValue: Number(program.totalValue),
      matriculaValue: Number(program.matriculaValue),
      modulesCount: program.modulesCount,
      isActive: program.isActive,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    };
  }

  static async deleteProgram(id: string): Promise<void> {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      throw new Error("No se puede eliminar programa: No hay institución seleccionada.");
    }
    const program = await prisma.program.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (program && program._count.students > 0) {
      throw new Error("No se puede eliminar un programa con estudiantes matriculados");
    }

    await prisma.program.delete({
      where: { id },
    });
  }
}
