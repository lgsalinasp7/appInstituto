import prisma from "@/lib/prisma";
import type { CreateProgramData, UpdateProgramData, Program, ProgramsListResponse } from "../types";

export class ProgramService {
  static async getPrograms(includeInactive = false): Promise<ProgramsListResponse> {
    const where = includeInactive ? {} : { isActive: true };

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
    const program = await prisma.program.findUnique({
      where: { id },
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
    const existing = await prisma.program.findUnique({
      where: { name: data.name },
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
    if (data.name) {
      const existing = await prisma.program.findFirst({
        where: {
          name: data.name,
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
    const program = await prisma.program.findUnique({
      where: { id },
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
