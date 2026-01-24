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
    };
  }

  static async createPayment(data: CreatePaymentData) {
    const receiptNumber = await this.generateReceiptNumber();

    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        method: data.method,
        reference: data.reference || null,
        receiptNumber,
        comments: data.comments || null,
        studentId: data.studentId,
        registeredById: data.registeredById,
      },
      include: {
        student: {
          select: { 
            id: true, 
            fullName: true, 
            documentNumber: true,
            email: true,
            phone: true,
            totalProgramValue: true,
          },
        },
        registeredBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const studentPayments = await prisma.payment.aggregate({
      where: { studentId: data.studentId },
      _sum: { amount: true },
    });

    const totalPaid = Number(studentPayments._sum.amount) || 0;
    const remainingBalance = Number(payment.student.totalProgramValue) - totalPaid;

    return {
      payment: {
        ...payment,
        amount: Number(payment.amount),
      },
      studentBalance: {
        totalPaid,
        remainingBalance,
        totalProgramValue: Number(payment.student.totalProgramValue),
      },
    };
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
