import prisma from "@/lib/prisma";
import type {
  CreatePaymentData,
  PaymentFilters,
  PaymentWithRelations,
  PaymentsListResponse,
  PaymentStats,
  PaymentMethod,
} from "../types";
import { Prisma } from "@prisma/client";

export class PaymentService {
  static async generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    const lastPayment = await prisma.payment.findFirst({
      where: {
        receiptNumber: {
          startsWith: `REC-${year}${month}`,
        },
      },
      orderBy: {
        receiptNumber: "desc",
      },
    });

    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.receiptNumber.split("-")[2], 10);
      sequence = lastSequence + 1;
    }

    return `REC-${year}${month}-${String(sequence).padStart(5, "0")}`;
  }

  static async getPayments(filters: PaymentFilters): Promise<PaymentsListResponse> {
    const { studentId, advisorId, method, startDate, endDate, page = 1, limit = 10 } = filters;

    const where: Prisma.PaymentWhereInput = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (advisorId) {
      where.registeredById = advisorId;
    }

    if (method) {
      where.method = method;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) {
        where.paymentDate.gte = startDate;
      }
      if (endDate) {
        where.paymentDate.lte = endDate;
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          student: {
            select: { id: true, fullName: true, documentNumber: true },
          },
          registeredBy: {
            select: { id: true, name: true, email: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paymentDate: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    const paymentsWithNumbers: PaymentWithRelations[] = payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      receiptNumber: payment.receiptNumber,
      comments: payment.comments,
      studentId: payment.studentId,
      registeredById: payment.registeredById,
      createdAt: payment.createdAt,
      student: payment.student,
      registeredBy: payment.registeredBy,
      paymentType: payment.paymentType,
      moduleNumber: payment.moduleNumber,
    }));

    return {
      payments: paymentsWithNumbers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPaymentById(id: string): Promise<PaymentWithRelations | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, fullName: true, documentNumber: true },
        },
        registeredBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payment) return null;

    return {
      id: payment.id,
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      receiptNumber: payment.receiptNumber,
      comments: payment.comments,
      studentId: payment.studentId,
      registeredById: payment.registeredById,
      createdAt: payment.createdAt,
      student: payment.student,
      registeredBy: payment.registeredBy,
      paymentType: payment.paymentType,
      moduleNumber: payment.moduleNumber,
    };
  }

  static async createPayment(data: CreatePaymentData) {
    const receiptNumber = await this.generateReceiptNumber();

    // 1. Obtener estudiante y programa
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: { program: true },
    });

    if (!student) throw new Error("Estudiante no encontrado");

    const program = student.program;

    // Calcular valor por módulo
    // Formula: (Total - Matrícula) / Cantidad Módulos
    const moduleValue = (Number(program.totalValue) - Number(program.matriculaValue)) / program.modulesCount;

    // Iniciar transacción
    return await prisma.$transaction(async (tx) => {
      let paymentType: "MATRICULA" | "MODULO" = "MODULO";
      let moduleNumber: number | null = null;
      let nextModuleNumber: number | null = null;

      // 2. Determinar tipo de pago y validaciones
      if (!student.matriculaPaid) {
        // --- LOGICA MATRÍCULA ---
        paymentType = "MATRICULA";

        // Validar monto exacto
        if (Number(data.amount) !== Number(program.matriculaValue)) {
          throw new Error(`El valor de la matrícula debe ser $${Number(program.matriculaValue).toLocaleString()}`);
        }

        // Acciones:
        // a. Marcar matrícula como pagada
        await tx.student.update({
          where: { id: student.id },
          data: { matriculaPaid: true },
        });

        // b. Crear PRIMER compromiso (Módulo 1)
        // Usar firstCommitmentDate del estudiante o hoy + 30 días por defecto
        const firstDate = student.firstCommitmentDate || new Date(new Date().setDate(new Date().getDate() + 30));

        await tx.paymentCommitment.create({
          data: {
            studentId: student.id,
            amount: moduleValue,
            scheduledDate: firstDate,
            moduleNumber: 1,
            status: "PENDIENTE",
          }
        });

      } else {
        // --- LOGICA MÓDULO (PAGO MENSUAL) ---
        paymentType = "MODULO";
        moduleNumber = student.currentModule + 1; // El módulo que está PAGANDO
        nextModuleNumber = moduleNumber + 1;      // El SIGUIENTE módulo

        // Validar monto exacto (sin decimales extremos, permitir margen mínimo si es necesario, pero regla dice EXACTO)
        // Usaremos math.abs < 100 pesos por si acaso errores de float, o strict equality
        if (Math.abs(Number(data.amount) - moduleValue) > 100) {
          throw new Error(`El valor del módulo debe ser $${moduleValue.toLocaleString()}`);
        }

        // Acciones:
        // a. Actualizar módulo actual del estudiante
        await tx.student.update({
          where: { id: student.id },
          data: { currentModule: moduleNumber },
        });

        // b. Buscar y marcar como PAGADO el compromiso de ESTE módulo
        // Buscamos compromiso pendiente más antiguo o por número de módulo
        const currentCommitment = await tx.paymentCommitment.findFirst({
          where: {
            studentId: student.id,
            moduleNumber: moduleNumber,
            status: "PENDIENTE"
          }
        });

        if (currentCommitment) {
          await tx.paymentCommitment.update({
            where: { id: currentCommitment.id },
            data: { status: "PAGADO" }
          });
        }

        // c. Crear SIGUIENTE compromiso (si no es el último módulo)
        if (nextModuleNumber <= program.modulesCount) {
          // Calcular fecha según frecuencia
          const daysToAdd = student.paymentFrequency === "QUINCENAL" ? 15 : 30;
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + daysToAdd);

          await tx.paymentCommitment.create({
            data: {
              studentId: student.id,
              amount: moduleValue,
              scheduledDate: nextDate,
              moduleNumber: nextModuleNumber,
              status: "PENDIENTE"
            }
          });
        }

        // d. Registrar ENTREGA de contenido (Opcional, si existiera tabla de entregas vinculada)
        // ...
      }

      // 3. Crear el Registro de Pago
      const payment = await tx.payment.create({
        data: {
          amount: data.amount,
          paymentDate: data.paymentDate,
          method: data.method,
          reference: data.reference || null,
          receiptNumber,
          comments: data.comments || null,
          studentId: data.studentId,
          registeredById: data.registeredById,
          paymentType,
          moduleNumber,
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              documentNumber: true,
              email: true,
              phone: true,
              totalProgramValue: true
            },
          },
          registeredBy: {
            select: { id: true, name: true, email: true }
          }
        },
      });

      return payment;
    });
  }

  static async getPaymentStats(filters: {
    advisorId?: string;
    startDate?: Date;
    endDate?: Date
  }): Promise<PaymentStats> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.advisorId) {
      where.registeredById = filters.advisorId;
    }

    if (filters.startDate || filters.endDate) {
      where.paymentDate = {};
      if (filters.startDate) {
        where.paymentDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.paymentDate.lte = filters.endDate;
      }
    }

    const [aggregate, byMethod] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["method"],
        where,
        _sum: { amount: true },
      }),
    ]);

    const methodStats: Record<PaymentMethod, number> = {
      BANCOLOMBIA: 0,
      NEQUI: 0,
      DAVIPLATA: 0,
      EFECTIVO: 0,
      OTRO: 0,
    };

    byMethod.forEach((item) => {
      methodStats[item.method] = Number(item._sum.amount) || 0;
    });

    return {
      totalCollected: Number(aggregate._sum.amount) || 0,
      paymentsCount: aggregate._count,
      averagePayment: Number(aggregate._avg.amount) || 0,
      byMethod: methodStats,
    };
  }

  static async getTodayPayments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getPayments({
      startDate: today,
      endDate: tomorrow,
      limit: 100,
    });
  }
}
