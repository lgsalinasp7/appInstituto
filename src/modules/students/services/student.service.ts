import prisma from "@/lib/prisma";
import type {
  CreateStudentData,
  UpdateStudentData,
  StudentFilters,
  StudentWithRelations,
  StudentsListResponse,
} from "../types";
import { Prisma } from "@prisma/client";

export class StudentService {
  static async getStudents(filters: StudentFilters): Promise<StudentsListResponse> {
    const { search, status, programId, advisorId, page = 1, limit = 10 } = filters;

    const where: Prisma.StudentWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { documentNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
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

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          program: {
            select: { id: true, name: true },
          },
          advisor: {
            select: { id: true, name: true, email: true },
          },
          payments: {
            select: { amount: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    const studentsWithBalance: StudentWithRelations[] = students.map((student) => {
      const totalPaid = student.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const remainingBalance = Number(student.totalProgramValue) - totalPaid;

      return {
        id: student.id,
        fullName: student.fullName,
        documentType: student.documentType,
        documentNumber: student.documentNumber,
        email: student.email,
        phone: student.phone,
        address: student.address,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        guardianEmail: student.guardianEmail,
        enrollmentDate: student.enrollmentDate,
        initialPayment: Number(student.initialPayment),
        totalProgramValue: Number(student.totalProgramValue),
        status: student.status,
        programId: student.programId,
        advisorId: student.advisorId,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        program: student.program,
        advisor: student.advisor,
        totalPaid,
        remainingBalance,
        paymentFrequency: student.paymentFrequency,
        firstCommitmentDate: student.firstCommitmentDate,
        currentModule: student.currentModule,
        matriculaPaid: student.matriculaPaid,
      };
    });

    return {
      students: studentsWithBalance,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getStudentById(id: string): Promise<StudentWithRelations | null> {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        program: {
          select: { id: true, name: true },
        },
        advisor: {
          select: { id: true, name: true, email: true },
        },
        payments: {
          select: { amount: true },
        },
      },
    });

    if (!student) return null;

    const totalPaid = student.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const remainingBalance = Number(student.totalProgramValue) - totalPaid;

    return {
      id: student.id,
      fullName: student.fullName,
      documentType: student.documentType,
      documentNumber: student.documentNumber,
      email: student.email,
      phone: student.phone,
      address: student.address,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      enrollmentDate: student.enrollmentDate,
      initialPayment: Number(student.initialPayment),
      totalProgramValue: Number(student.totalProgramValue),
      status: student.status,
      programId: student.programId,
      advisorId: student.advisorId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      program: student.program,
      advisor: student.advisor,
      totalPaid,
      remainingBalance,
      paymentFrequency: student.paymentFrequency,
      firstCommitmentDate: student.firstCommitmentDate,
      currentModule: student.currentModule,
      matriculaPaid: student.matriculaPaid,
    };
  }

  static async createStudent(data: CreateStudentData) {
    const existingStudent = await prisma.student.findUnique({
      where: { documentNumber: data.documentNumber },
    });

    if (existingStudent) {
      throw new Error("Ya existe un estudiante con este número de documento");
    }

    const student = await prisma.student.create({
      data: {
        fullName: data.fullName,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        email: data.email || null,
        phone: data.phone,
        address: data.address || null,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        guardianEmail: data.guardianEmail || null,
        enrollmentDate: data.enrollmentDate,
        initialPayment: data.initialPayment,
        totalProgramValue: data.totalProgramValue,
        status: data.status || "MATRICULADO",
        programId: data.programId,
        advisorId: data.advisorId,
        paymentFrequency: data.paymentFrequency,
        firstCommitmentDate: data.firstCommitmentDate,
        currentModule: 0,
        matriculaPaid: false,
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

    return {
      ...student,
      initialPayment: Number(student.initialPayment),
      totalProgramValue: Number(student.totalProgramValue),
    };
  }

  static async updateStudent(id: string, data: UpdateStudentData) {
    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        email: data.email || null,
        guardianEmail: data.guardianEmail || null,
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

    return student;
  }

  static async deleteStudent(id: string) {
    await prisma.$transaction(async (tx) => {
      // 1. Obtener todos los pagos del estudiante para borrar sus recibos
      const payments = await tx.payment.findMany({
        where: { studentId: id },
        select: { id: true },
      });
      const paymentIds = payments.map((p) => p.id);

      // 2. Eliminar recibos asociados a esos pagos
      if (paymentIds.length > 0) {
        await tx.receipt.deleteMany({
          where: { paymentId: { in: paymentIds } },
        });
      }

      // 3. Eliminar pagos
      await tx.payment.deleteMany({
        where: { studentId: id },
      });

      // 4. Eliminar compromisos (cuotas)
      await tx.paymentCommitment.deleteMany({
        where: { studentId: id },
      });

      // 5. Eliminar entregas de contenido
      await tx.contentDelivery.deleteMany({
        where: { studentId: id },
      });

      // 6. Finalmente, eliminar al estudiante
      await tx.student.delete({
        where: { id },
      });
    });
  }

  static async getStudentPaymentsSummary(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        payments: {
          orderBy: { paymentDate: "desc" },
          include: {
            registeredBy: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!student) return null;

    const totalPaid = student.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const remainingBalance = Number(student.totalProgramValue) - totalPaid;
    const paymentProgress = (totalPaid / Number(student.totalProgramValue)) * 100;

    return {
      totalProgramValue: Number(student.totalProgramValue),
      initialPayment: Number(student.initialPayment),
      totalPaid,
      remainingBalance,
      paymentProgress: Math.min(paymentProgress, 100),
      paymentsCount: student.payments.length,
      payments: student.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        method: p.method,
        reference: p.reference,
        receiptNumber: p.receiptNumber,
        comments: p.comments,
        registeredBy: p.registeredBy,
        createdAt: p.createdAt,
      })),
    };
  }
}
