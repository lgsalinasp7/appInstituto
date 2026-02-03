import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import type {
  CreateCommitmentData,
  UpdateCommitmentData,
  CarteraFilters,
  CarteraAlert,
  CarteraSummary,
  StudentDebt,
  PaymentCommitmentData,
} from "../types";
import { Prisma } from "@prisma/client";

export class CarteraService {
  static async getCommitments(filters: CarteraFilters) {
    const { advisorId, status, startDate, endDate, page = 1, limit = 10 } = filters;
    const tenantId = await getCurrentTenantId() as string;

    const where: Prisma.PaymentCommitmentWhereInput = { tenantId };

    if (status) {
      where.status = status;
    }

    if (advisorId) {
      where.student = {
        advisorId,
      };
    }

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = startDate;
      }
      if (endDate) {
        where.scheduledDate.lte = endDate;
      }
    }

    const [commitments, total] = await Promise.all([
      prisma.paymentCommitment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              documentNumber: true,
              phone: true,
              email: true,
              advisor: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledDate: "asc" },
      }),
      prisma.paymentCommitment.count({ where }),
    ]);

    const commitmentsData: PaymentCommitmentData[] = commitments.map((c) => ({
      id: c.id,
      scheduledDate: c.scheduledDate,
      amount: Number(c.amount),
      status: c.status,
      rescheduledDate: c.rescheduledDate,
      comments: c.comments,
      studentId: c.studentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      student: c.student,
    }));

    return {
      commitments: commitmentsData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async createCommitment(data: CreateCommitmentData) {
    const tenantId = await getCurrentTenantId() as string;
    const commitment = await prisma.paymentCommitment.create({
      data: {
        scheduledDate: data.scheduledDate,
        amount: data.amount,
        comments: data.comments || null,
        studentId: data.studentId,
        tenantId,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            documentNumber: true,
            phone: true,
            email: true,
            advisor: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return commitment;
  }

  static async updateCommitment(id: string, data: UpdateCommitmentData) {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia al tenant
    const existing = await prisma.paymentCommitment.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Compromiso no encontrado o no pertenece a este instituto");
    }

    const commitment = await prisma.paymentCommitment.update({
      where: { id },
      data: {
        ...data,
        rescheduledDate: data.rescheduledDate || undefined,
        comments: data.comments ?? undefined,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            documentNumber: true,
            phone: true,
            email: true,
            advisor: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return commitment;
  }

  static async markAsPaid(id: string) {
    return this.updateCommitment(id, { status: "PAGADO" });
  }

  static async reschedule(id: string, newDate: Date, comments?: string) {
    return this.updateCommitment(id, {
      status: "EN_COMPROMISO",
      rescheduledDate: newDate,
      comments,
    });
  }

  static async getAlerts(advisorId?: string): Promise<CarteraAlert[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tenantId = await getCurrentTenantId() as string;

    const where: Prisma.PaymentCommitmentWhereInput = {
      tenantId,
      status: { not: "PAGADO" },
    };

    if (advisorId) {
      where.student = { advisorId };
    }

    const commitments = await prisma.paymentCommitment.findMany({
      where: {
        ...where,
        scheduledDate: { lte: nextWeek },
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            advisor: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    const alerts: CarteraAlert[] = commitments.map((c) => {
      const dueDate = new Date(c.scheduledDate);
      dueDate.setHours(0, 0, 0, 0);

      let type: "overdue" | "today" | "upcoming";
      let daysOverdue: number | undefined;

      if (dueDate < today) {
        type = "overdue";
        daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      } else if (dueDate.getTime() === today.getTime()) {
        type = "today";
      } else {
        type = "upcoming";
      }

      return {
        id: c.id,
        type,
        studentName: c.student.fullName,
        studentPhone: c.student.phone,
        amount: Number(c.amount),
        dueDate: c.scheduledDate,
        daysOverdue,
        advisorName: c.student.advisor.name || "Sin asignar",
        studentId: c.student.id,
      };
    });

    return alerts.sort((a, b) => {
      const priority = { overdue: 0, today: 1, upcoming: 2 };
      return priority[a.type] - priority[b.type];
    });
  }

  static async getSummary(advisorId?: string): Promise<CarteraSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tenantId = await getCurrentTenantId() as string;

    const baseWhere: Prisma.PaymentCommitmentWhereInput = {
      tenantId,
      status: { not: "PAGADO" },
    };

    if (advisorId) {
      baseWhere.student = { advisorId };
    }

    const [overdue, todayCommitments, upcoming, totalPending] = await Promise.all([
      prisma.paymentCommitment.aggregate({
        where: {
          ...baseWhere,
          scheduledDate: { lt: today },
        },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.paymentCommitment.aggregate({
        where: {
          ...baseWhere,
          scheduledDate: { gte: today, lt: tomorrow },
        },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.paymentCommitment.aggregate({
        where: {
          ...baseWhere,
          scheduledDate: { gte: tomorrow, lte: nextWeek },
        },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.paymentCommitment.aggregate({
        where: baseWhere,
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPendingAmount: Number(totalPending._sum.amount) || 0,
      overdueCount: overdue._count,
      overdueAmount: Number(overdue._sum.amount) || 0,
      todayCount: todayCommitments._count,
      todayAmount: Number(todayCommitments._sum.amount) || 0,
      upcomingCount: upcoming._count,
      upcomingAmount: Number(upcoming._sum.amount) || 0,
    };
  }

  static async getStudentsWithDebt(advisorId?: string): Promise<StudentDebt[]> {
    const tenantId = await getCurrentTenantId() as string;

    const where: Prisma.StudentWhereInput = {
      tenantId,
      status: "MATRICULADO",
    };

    if (advisorId) {
      where.advisorId = advisorId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        program: {
          select: { name: true },
        },
        advisor: {
          select: { name: true },
        },
        payments: {
          select: { amount: true, paymentDate: true },
          orderBy: { paymentDate: "desc" },
        },
        commitments: {
          where: { status: { not: "PAGADO" } },
          orderBy: { scheduledDate: "asc" },
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                documentNumber: true,
                phone: true,
                email: true,
                advisor: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    const today = new Date();

    const studentsWithDebt: StudentDebt[] = students
      .map((student) => {
        const totalPaid = student.payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );
        const totalProgramValue = Number(student.totalProgramValue);
        const remainingBalance = totalProgramValue - totalPaid;

        const lastPayment = student.payments[0];
        const lastPaymentDate = lastPayment?.paymentDate || null;
        const daysSinceLastPayment = lastPaymentDate
          ? Math.floor((today.getTime() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          studentId: student.id,
          studentName: student.fullName,
          documentNumber: student.documentNumber,
          phone: student.phone,
          email: student.email,
          programName: student.program.name,
          advisorName: student.advisor.name || "Sin asignar",
          totalProgramValue,
          totalPaid,
          remainingBalance,
          lastPaymentDate,
          daysSinceLastPayment,
          commitments: student.commitments.map((c) => ({
            id: c.id,
            scheduledDate: c.scheduledDate,
            amount: Number(c.amount),
            status: c.status,
            rescheduledDate: c.rescheduledDate,
            comments: c.comments,
            studentId: c.studentId,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            student: c.student,
          })),
        };
      })
      .filter((s) => s.remainingBalance > 0)
      .sort((a, b) => b.remainingBalance - a.remainingBalance);

    return studentsWithDebt;
  }
}
