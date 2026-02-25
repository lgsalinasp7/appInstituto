import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
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

    const tenantId = await getCurrentTenantId() as string;
    const where: Prisma.StudentWhereInput = {
      tenantId
    };

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
        city: student.city,
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
    const tenantId = await getCurrentTenantId() as string;
    const student = await prisma.student.findFirst({
      where: { id, tenantId },
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
      city: student.city,
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
    const tenantId = await getCurrentTenantId() as string;
    const existingStudent = await prisma.student.findFirst({
      where: { documentNumber: data.documentNumber, tenantId },
    });

    if (existingStudent) {
      throw new Error("Ya existe un estudiante con este número de documento");
    }

    // Obtener el programa para calcular valores
    const program = await prisma.program.findFirst({
      where: { id: data.programId, tenantId },
    });

    if (!program) {
      throw new Error("El programa seleccionado no existe");
    }

    // Generar número de recibo único
    const generateReceiptNumber = () => {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
      return `REC-${year}-${random}`;
    };

    // Calcular valor por módulo basado en los valores REALES ingresados
    const valorModulo = (Number(data.totalProgramValue) - Number(data.initialPayment)) / program.modulesCount;

    // Ejecutar todo en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el estudiante con matrícula pagada
      const student = await tx.student.create({
        data: {
          fullName: data.fullName,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          email: data.email || null,
          phone: data.phone,
          city: data.city || null,
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
          matriculaPaid: true, // ✅ Ya pagó la matrícula
          tenantId,
        },
        include: {
          program: {
            select: { id: true, name: true, matriculaValue: true, totalValue: true, modulesCount: true },
          },
          advisor: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // 2. Registrar el pago de matrícula
      const receiptNumber = generateReceiptNumber();
      const payment = await tx.payment.create({
        data: {
          studentId: student.id,
          amount: Number(data.initialPayment),
          paymentDate: new Date(),
          method: data.paymentMethod || "EFECTIVO",
          reference: data.paymentReference || null,
          paymentType: "MATRICULA",
          moduleNumber: null, // No aplica para matrícula
          receiptNumber: receiptNumber,
          registeredById: data.advisorId,
          tenantId,
        },
      });

      // 3. Crear el primer compromiso de pago (Módulo 1)
      const commitment = await tx.paymentCommitment.create({
        data: {
          studentId: student.id,
          amount: valorModulo,
          scheduledDate: data.firstCommitmentDate,
          moduleNumber: 1,
          status: "PENDIENTE",
          tenantId,
        },
      });

      return {
        student,
        payment,
        commitment,
        program,
      };
    });

    // Retornar datos completos para el recibo
    return {
      student: {
        ...result.student,
        initialPayment: Number(result.student.initialPayment),
        totalProgramValue: Number(result.student.totalProgramValue),
      },
      payment: {
        id: result.payment.id,
        amount: Number(result.payment.amount),
        paymentDate: result.payment.paymentDate,
        method: result.payment.method,
        reference: result.payment.reference,
        paymentType: result.payment.paymentType,
        receiptNumber: result.payment.receiptNumber,
      },
      commitment: {
        id: result.commitment.id,
        amount: Number(result.commitment.amount),
        scheduledDate: result.commitment.scheduledDate,
        moduleNumber: result.commitment.moduleNumber,
      },
      program: {
        name: result.program.name,
        totalValue: Number(result.program.totalValue),
        matriculaValue: Number(result.program.matriculaValue),
        modulesCount: result.program.modulesCount,
      },
    };
  }

  static async updateStudent(id: string, data: UpdateStudentData) {
    const tenantId = await getCurrentTenantId() as string;

    // Verificamos que el estudiante existe y pertenece al tenant antes de actualizar
    const existing = await prisma.student.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Estudiante no encontrado o no pertenece a este instituto");
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        email: data.email || null,
        city: data.city || null,
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
    const tenantId = await getCurrentTenantId() as string;

    await prisma.$transaction(async (tx) => {
      // 0. Verificar pertenencia al tenant
      const existing = await tx.student.findFirst({
        where: { id, tenantId }
      });

      if (!existing) {
        throw new Error("Estudiante no encontrado o no pertenece a este instituto");
      }

      // 1. Obtener todos los pagos del estudiante para borrar sus recibos
      const payments = await tx.payment.findMany({
        where: { studentId: id, tenantId },
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
        where: { studentId: id, tenantId },
      });

      // 4. Eliminar compromisos (cuotas)
      await tx.paymentCommitment.deleteMany({
        where: { studentId: id, tenantId },
      });

      // 5. Eliminar entregas de contenido
      await tx.contentDelivery.deleteMany({
        where: { studentId: id }, // contentDelivery doesn't have tenantId in schema, but it's linked to student
      });

      // 6. Finalmente, eliminar al estudiante
      await tx.student.delete({
        where: { id },
      });
    });
  }

  static async getStudentPaymentsSummary(studentId: string) {
    const tenantId = await getCurrentTenantId() as string;
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        payments: {
          where: { tenantId },
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

  static async getMatriculaReceipt(studentId: string) {
    const tenantId = await getCurrentTenantId() as string;
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        program: true,
        advisor: {
          select: { id: true, name: true, email: true },
        },
        payments: {
          where: { paymentType: "MATRICULA", tenantId },
          include: {
            registeredBy: {
              select: { name: true, email: true },
            },
          },
          take: 1,
          orderBy: { paymentDate: "desc" },
        },
        commitments: {
          where: { moduleNumber: 1, tenantId },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    const matriculaPayment = student.payments[0];
    if (!matriculaPayment) {
      throw new Error("No se encontró el pago de matrícula para este estudiante");
    }

    const firstCommitment = student.commitments[0];
    if (!firstCommitment) {
      throw new Error("No se encontró el compromiso de pago del primer módulo");
    }

    return {
      student: {
        id: student.id,
        fullName: student.fullName,
        documentType: student.documentType,
        documentNumber: student.documentNumber,
        phone: student.phone,
        email: student.email,
        city: student.city,
      },
      payment: {
        id: matriculaPayment.id,
        amount: Number(matriculaPayment.amount),
        paymentDate: matriculaPayment.paymentDate,
        method: matriculaPayment.method,
        reference: matriculaPayment.reference,
        paymentType: matriculaPayment.paymentType,
        receiptNumber: matriculaPayment.receiptNumber,
      },
      commitment: {
        amount: Number(firstCommitment.amount),
        scheduledDate: firstCommitment.scheduledDate,
        moduleNumber: firstCommitment.moduleNumber,
      },
      program: {
        name: student.program.name,
        totalValue: Number(student.program.totalValue),
        matriculaValue: Number(student.program.matriculaValue),
        modulesCount: student.program.modulesCount,
      },
      registeredBy: {
        name: matriculaPayment.registeredBy?.name || "Sistema",
      },
    };
  }
}
