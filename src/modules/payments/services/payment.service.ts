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

        // Si el pago es total o mayor, marcamos como pagada
        if (Number(data.amount) >= Number(program.matriculaValue)) {
          await tx.student.update({
            where: { id: student.id },
            data: { matriculaPaid: true },
          });

          // Crear PRIMER compromiso (Módulo 1)
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
        }
        // Si el pago es parcial (< matriculaValue), no marcamos matriculaPaid: true
        // El frontend o backend debería permitir completar el saldo después.
        // Para simplificar esta versión, permitimos cualquier monto y si completa el valor, se activa.

      } else {
        // --- LOGICA MODULO (PAGO MENSUAL O MULTIPLES MODULOS) ---
        paymentType = "MODULO";

        // Buscamos el compromiso pendiente más antiguo
        const currentCommitment = await tx.paymentCommitment.findFirst({
          where: {
            studentId: student.id,
            status: "PENDIENTE"
          },
          orderBy: { moduleNumber: "asc" }
        });

        if (currentCommitment) {
          const minimumPayment = Number(currentCommitment.amount);

          // VALIDACION: El pago MINIMO es el valor del compromiso actual
          if (Number(data.amount) < minimumPayment) {
            throw new Error(
              `El pago mínimo es $${minimumPayment.toLocaleString()}. No se permiten abonos menores al valor del módulo.`
            );
          }

          moduleNumber = currentCommitment.moduleNumber;
          let remainingAmount = Number(data.amount);
          let currentMod = currentCommitment;
          let modulesCompleted = 0;

          // Procesar pagos de múltiples módulos si el monto lo permite
          while (remainingAmount >= Number(currentMod.amount)) {
            // Marcar este compromiso como pagado
            await tx.paymentCommitment.update({
              where: { id: currentMod.id },
              data: { status: "PAGADO" }
            });

            remainingAmount -= Number(currentMod.amount);
            modulesCompleted++;

            // Actualizar módulo actual del estudiante
            await tx.student.update({
              where: { id: student.id },
              data: { currentModule: currentMod.moduleNumber },
            });

            // Crear siguiente compromiso si no existe y no es el último
            const nextModNum = currentMod.moduleNumber + 1;
            if (nextModNum <= program.modulesCount) {
              let nextCommitment = await tx.paymentCommitment.findFirst({
                where: { studentId: student.id, moduleNumber: nextModNum }
              });

              if (!nextCommitment) {
                const daysToAdd = student.paymentFrequency === "QUINCENAL" ? 15 : 30;
                const nextDate = new Date(currentMod.scheduledDate);
                nextDate.setDate(nextDate.getDate() + daysToAdd);

                nextCommitment = await tx.paymentCommitment.create({
                  data: {
                    studentId: student.id,
                    amount: moduleValue,
                    scheduledDate: nextDate,
                    moduleNumber: nextModNum,
                    status: "PENDIENTE"
                  }
                });
              }

              // Si hay sobrante suficiente, seguimos al siguiente módulo
              if (remainingAmount >= Number(nextCommitment.amount)) {
                currentMod = nextCommitment;
              } else {
                // No hay suficiente para el siguiente, detener el loop
                break;
              }
            } else {
              // Es el último módulo, no hay más
              break;
            }
          }
        } else {
          // Si no hay compromisos pendientes pero ya pagó matrícula, crear el Módulo 1
          if (student.currentModule < program.modulesCount) {
            const nextMod = student.currentModule + 1;

            // Validar que al menos pague un módulo completo
            if (Number(data.amount) < moduleValue) {
              throw new Error(
                `El pago mínimo es $${moduleValue.toLocaleString()} (valor del módulo).`
              );
            }

            // Crear primer compromiso como ya pagado
            await tx.paymentCommitment.create({
              data: {
                studentId: student.id,
                amount: moduleValue,
                scheduledDate: new Date(),
                moduleNumber: nextMod,
                status: "PAGADO",
                comments: `Creado y pagado en una sola transacción.`
              }
            });

            await tx.student.update({
              where: { id: student.id },
              data: { currentModule: nextMod },
            });

            moduleNumber = nextMod;
          }
        }
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
