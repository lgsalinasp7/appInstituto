import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import type {
  CreateContentData,
  UpdateContentData,
  DeliverContentData,
  AcademicContent,
  StudentContentStatus,
} from "../types";

export class ContentService {
  static async getContentsByProgram(programId: string): Promise<AcademicContent[]> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar que el programa pertenece al tenant
    const program = await prisma.program.findFirst({
      where: { id: programId, tenantId }
    });

    if (!program) {
      throw new Error("Programa no encontrado o no pertenece a este instituto");
    }

    const contents = await prisma.academicContent.findMany({
      where: { programId },
      orderBy: { orderIndex: "asc" },
      include: {
        program: {
          select: { id: true, name: true },
        },
      },
    });

    return contents.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      orderIndex: c.orderIndex,
      programId: c.programId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      program: c.program,
    }));
  }

  static async createContent(data: CreateContentData): Promise<AcademicContent> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar que el programa pertenece al tenant
    const program = await prisma.program.findFirst({
      where: { id: data.programId, tenantId }
    });

    if (!program) {
      throw new Error("Programa no encontrado o no pertenece a este instituto");
    }

    const content = await prisma.academicContent.create({
      data: {
        name: data.name,
        description: data.description || null,
        orderIndex: data.orderIndex,
        programId: data.programId,
      },
      include: {
        program: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: content.id,
      name: content.name,
      description: content.description,
      orderIndex: content.orderIndex,
      programId: content.programId,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      program: content.program,
    };
  }

  static async updateContent(id: string, data: UpdateContentData): Promise<AcademicContent> {
    const content = await prisma.academicContent.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? undefined,
        orderIndex: data.orderIndex,
      },
      include: {
        program: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: content.id,
      name: content.name,
      description: content.description,
      orderIndex: content.orderIndex,
      programId: content.programId,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      program: content.program,
    };
  }

  static async deleteContent(id: string): Promise<void> {
    await prisma.academicContent.delete({
      where: { id },
    });
  }

  static async deliverContent(data: DeliverContentData) {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar que el estudiante pertenece al tenant
    const student = await prisma.student.findFirst({
      where: { id: data.studentId, tenantId }
    });

    if (!student) {
      throw new Error("Estudiante no encontrado o no pertenece a este instituto");
    }

    const existingDelivery = await prisma.contentDelivery.findFirst({
      where: {
        studentId: data.studentId,
        contentId: data.contentId,
      },
    });

    if (existingDelivery) {
      throw new Error("Este contenido ya fue entregado al estudiante");
    }

    const delivery = await prisma.contentDelivery.create({
      data: {
        studentId: data.studentId,
        contentId: data.contentId,
        method: data.method,
      },
      include: {
        student: {
          select: { id: true, fullName: true },
        },
        content: {
          select: { id: true, name: true },
        },
      },
    });

    return delivery;
  }

  static async getStudentContentStatus(studentId: string): Promise<StudentContentStatus | null> {
    const tenantId = await getCurrentTenantId() as string;

    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        program: {
          select: { id: true, name: true },
        },
        payments: {
          select: { amount: true },
        },
        contentDeliveries: {
          include: {
            content: {
              select: { id: true, name: true, orderIndex: true },
            },
          },
        },
      },
    });

    if (!student) return null;

    const programContents = await prisma.academicContent.findMany({
      where: { programId: student.programId },
      orderBy: { orderIndex: "asc" },
    });

    const totalPayments = student.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const paymentsCount = student.payments.length;

    const availableContentCount = Math.min(paymentsCount, programContents.length);
    const availableContents = programContents.slice(0, availableContentCount);

    const deliveredContentIds = new Set(
      student.contentDeliveries.map((d) => d.content.id)
    );

    const pendingContents = availableContents.filter(
      (c) => !deliveredContentIds.has(c.id)
    );

    return {
      studentId: student.id,
      studentName: student.fullName,
      programId: student.programId,
      programName: student.program.name,
      totalPayments,
      paymentsCount,
      availableContents: availableContents.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        orderIndex: c.orderIndex,
        programId: c.programId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      deliveredContents: student.contentDeliveries.map((d) => ({
        id: d.id,
        deliveredAt: d.deliveredAt,
        method: d.method,
        studentId: d.studentId,
        contentId: d.contentId,
        content: d.content,
      })),
      pendingContents: pendingContents.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        orderIndex: c.orderIndex,
        programId: c.programId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  }

  static async getStudentDeliveries(studentId: string) {
    const deliveries = await prisma.contentDelivery.findMany({
      where: { studentId },
      include: {
        content: {
          select: { id: true, name: true, orderIndex: true },
        },
      },
      orderBy: { deliveredAt: "desc" },
    });

    return deliveries;
  }

  static async getPendingDeliveries(advisorId?: string) {
    const tenantId = await getCurrentTenantId() as string;

    const students = await prisma.student.findMany({
      where: {
        tenantId,
        status: "MATRICULADO",
        ...(advisorId && { advisorId }),
      },
      include: {
        program: {
          select: { id: true, name: true },
        },
        payments: {
          select: { id: true },
        },
        contentDeliveries: {
          select: { contentId: true },
        },
      },
    });

    const pendingDeliveries = [];

    for (const student of students) {
      const programContents = await prisma.academicContent.findMany({
        where: { programId: student.programId },
        orderBy: { orderIndex: "asc" },
      });

      const availableCount = Math.min(student.payments.length, programContents.length);
      const availableContents = programContents.slice(0, availableCount);

      const deliveredIds = new Set(student.contentDeliveries.map((d) => d.contentId));
      const pending = availableContents.filter((c) => !deliveredIds.has(c.id));

      if (pending.length > 0) {
        pendingDeliveries.push({
          studentId: student.id,
          studentName: student.fullName,
          programName: student.program.name,
          pendingContents: pending,
        });
      }
    }

    return pendingDeliveries;
  }
}
