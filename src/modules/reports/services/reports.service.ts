import prisma from "@/lib/prisma";
import type {
  ReportFilters,
  FinancialReport,
  AdvisorReport,
  ProgramReport,
  DashboardStats,
  RevenueChartData,
  PortfolioAgingReport,
  AgingBracket,
} from "../types";
import { Prisma } from "@prisma/client";

export class ReportsService {
  static async getFinancialReport(filters: ReportFilters): Promise<FinancialReport> {
    const { advisorId, startDate, endDate } = filters;

    const where: Prisma.PaymentWhereInput = {};

    if (advisorId) {
      where.registeredById = advisorId;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = startDate;
      if (endDate) where.paymentDate.lte = endDate;
    }

    const [payments, byMethod, pendingCommitments] = await Promise.all([
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
        _count: true,
      }),
      prisma.paymentCommitment.aggregate({
        where: {
          status: { not: "PAGADO" },
          ...(advisorId && { student: { advisorId } }),
        },
        _sum: { amount: true },
      }),
    ]);

    const dailyPayments = await prisma.payment.groupBy({
      by: ["paymentDate"],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: { paymentDate: "asc" },
    });

    const dailyRevenue = dailyPayments.map((d) => ({
      date: d.paymentDate.toISOString().split("T")[0],
      amount: Number(d._sum.amount) || 0,
      count: d._count,
    }));

    return {
      period: startDate && endDate
        ? `${startDate.toLocaleDateString("es-CO")} - ${endDate.toLocaleDateString("es-CO")}`
        : "Todo el tiempo",
      totalRevenue: Number(payments._sum.amount) || 0,
      totalPayments: payments._count,
      averagePayment: Number(payments._avg.amount) || 0,
      pendingAmount: Number(pendingCommitments._sum.amount) || 0,
      byMethod: byMethod.map((m) => ({
        method: m.method,
        amount: Number(m._sum.amount) || 0,
        count: m._count,
      })),
      dailyRevenue,
    };
  }

  static async getAdvisorReports(_filters?: ReportFilters): Promise<AdvisorReport[]> {
    const advisors = await prisma.user.findMany({
      where: {
        role: {
          name: { in: ["admin", "advisor", "asesor"] },
        },
        isActive: true,
      },
      include: {
        students: {
          include: {
            payments: {
              select: { amount: true, paymentDate: true },
            },
          },
        },
        registeredPayments: {
          select: { amount: true, paymentDate: true },
        },
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return advisors.map((advisor) => {
      const totalStudents = advisor.students.length;
      const activeStudents = advisor.students.filter(
        (s) => s.status === "MATRICULADO"
      ).length;

      const totalSales = advisor.students.reduce(
        (sum, s) => sum + Number(s.totalProgramValue),
        0
      );

      const totalCollected = advisor.registeredPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      const pendingAmount = advisor.students.reduce((sum, s) => {
        const paid = s.payments.reduce((p, pay) => p + Number(pay.amount), 0);
        return sum + (Number(s.totalProgramValue) - paid);
      }, 0);

      const collectionRate = totalSales > 0
        ? (totalCollected / totalSales) * 100
        : 0;

      const studentsThisMonth = advisor.students.filter(
        (s) => new Date(s.enrollmentDate) >= startOfMonth
      ).length;

      const revenueThisMonth = advisor.registeredPayments
        .filter((p) => new Date(p.paymentDate) >= startOfMonth)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        advisorId: advisor.id,
        advisorName: advisor.name || "Sin nombre",
        advisorEmail: advisor.email,
        totalStudents,
        activeStudents,
        totalSales,
        totalCollected,
        pendingAmount,
        collectionRate: Math.round(collectionRate * 100) / 100,
        studentsThisMonth,
        revenueThisMonth,
      };
    }).sort((a, b) => b.totalCollected - a.totalCollected);
  }

  static async getProgramReports(): Promise<ProgramReport[]> {
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      include: {
        students: {
          include: {
            payments: {
              select: { amount: true },
            },
          },
        },
      },
    });

    return programs.map((program) => {
      const totalStudents = program.students.length;
      const activeStudents = program.students.filter(
        (s) => s.status === "MATRICULADO"
      ).length;

      const totalRevenue = program.students.reduce((sum, s) => {
        return sum + s.payments.reduce((p, pay) => p + Number(pay.amount), 0);
      }, 0);

      const pendingAmount = program.students.reduce((sum, s) => {
        const paid = s.payments.reduce((p, pay) => p + Number(pay.amount), 0);
        return sum + (Number(s.totalProgramValue) - paid);
      }, 0);

      const paymentProgresses = program.students.map((s) => {
        const paid = s.payments.reduce((p, pay) => p + Number(pay.amount), 0);
        return (paid / Number(s.totalProgramValue)) * 100;
      });

      const averagePaymentProgress = paymentProgresses.length > 0
        ? paymentProgresses.reduce((a, b) => a + b, 0) / paymentProgresses.length
        : 0;

      return {
        programId: program.id,
        programName: program.name,
        totalStudents,
        activeStudents,
        totalRevenue,
        pendingAmount,
        averagePaymentProgress: Math.round(averagePaymentProgress * 100) / 100,
      };
    }).sort((a, b) => b.totalStudents - a.totalStudents);
  }

  static async getDashboardStats(advisorId?: string): Promise<DashboardStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const studentWhere: Prisma.StudentWhereInput = advisorId
      ? { advisorId }
      : {};

    const paymentWhere: Prisma.PaymentWhereInput = advisorId
      ? { registeredById: advisorId }
      : {};

    const [
      todayRevenueAggregate,
      currentMonthRevenueAggregate,
      lastMonthRevenueAggregate,
      activeStudents,
      lastMonthStudents,
      totalPendingCommitments,
      overdueCommitmentsAggregate,
      lastMonthPending,
      totalProspects,
      closedProspects,
    ] = await Promise.all([
      // 1. Recaudo HOY
      prisma.payment.aggregate({
        where: { ...paymentWhere, paymentDate: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      // 2. Recaudo MES ACTUAL
      prisma.payment.aggregate({
        where: { ...paymentWhere, paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      // 3. Recaudo MES PASADO
      prisma.payment.aggregate({
        where: { ...paymentWhere, paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { amount: true },
      }),
      // 4. Estudiantes Activos
      prisma.student.count({
        where: { ...studentWhere, status: "MATRICULADO" },
      }),
      // 5. Estudiantes Activos Mes Pasado
      prisma.student.count({
        where: { ...studentWhere, status: "MATRICULADO", enrollmentDate: { lte: endOfLastMonth } },
      }),
      // 6. Conteo compromisos pendientes
      prisma.paymentCommitment.count({
        where: { status: "PENDIENTE", ...(advisorId && { student: { advisorId } }) },
      }),
      // 7. Monto Cartera en Mora (Vencida)
      prisma.paymentCommitment.aggregate({
        where: {
          status: "PENDIENTE",
          scheduledDate: { lt: today },
          ...(advisorId && { student: { advisorId } })
        },
        _sum: { amount: true },
      }),
      // 8. Pendientes mes pasado
      prisma.paymentCommitment.count({
        where: { status: "PENDIENTE", createdAt: { lte: endOfLastMonth }, ...(advisorId && { student: { advisorId } }) },
      }),
      // 9. Prospectos
      prisma.prospect.count({
        where: advisorId ? { advisorId } : {},
      }),
      // 10. Cerrados
      prisma.prospect.count({
        where: { status: "CERRADO", ...(advisorId && { advisorId }) },
      }),
    ]);

    const todayRevenue = Number(todayRevenueAggregate._sum.amount) || 0;
    const monthlyRevenue = Number(currentMonthRevenueAggregate._sum.amount) || 0;
    const lastMonthRevenueAmount = Number(lastMonthRevenueAggregate._sum.amount) || 0;
    const overdueAmount = Number(overdueCommitmentsAggregate._sum.amount) || 0;

    const revenueChange = lastMonthRevenueAmount > 0
      ? ((monthlyRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100
      : 0;

    const studentsChange = lastMonthStudents > 0
      ? ((activeStudents - lastMonthStudents) / lastMonthStudents) * 100
      : 0;

    const pendingChange = lastMonthPending > 0
      ? ((totalPendingCommitments - lastMonthPending) / lastMonthPending) * 100
      : 0;

    const conversionRate = totalProspects > 0
      ? (closedProspects / totalProspects) * 100
      : 0;

    return {
      todayRevenue,
      monthlyRevenue,
      revenueChange: Math.round(revenueChange * 100) / 100,
      activeStudents,
      studentsChange: Math.round(studentsChange * 100) / 100,
      pendingPaymentsCount: totalPendingCommitments,
      overdueAmount,
      pendingChange: Math.round(pendingChange * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  static async getRevenueChartData(
    period: "week" | "month" = "month",
    advisorId?: string
  ): Promise<RevenueChartData[]> {
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;

    if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = "day";
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFormat = "week";
    }

    const where: Prisma.PaymentWhereInput = {
      paymentDate: { gte: startDate },
    };

    if (advisorId) {
      where.registeredById = advisorId;
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        amount: true,
        paymentDate: true,
      },
      orderBy: { paymentDate: "asc" },
    });

    if (groupFormat === "day") {
      const dailyTotals: Record<string, number> = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const key = date.toLocaleDateString("es-CO", { weekday: "short" });
        dailyTotals[key] = 0;
      }

      payments.forEach((p) => {
        const key = new Date(p.paymentDate).toLocaleDateString("es-CO", { weekday: "short" });
        dailyTotals[key] = (dailyTotals[key] || 0) + Number(p.amount);
      });

      return Object.entries(dailyTotals).map(([name, total]) => ({ name, total }));
    } else {
      const weeklyTotals: Record<string, number> = {
        "Semana 1": 0,
        "Semana 2": 0,
        "Semana 3": 0,
        "Semana 4": 0,
      };

      payments.forEach((p) => {
        const day = new Date(p.paymentDate).getDate();
        const weekNum = Math.ceil(day / 7);
        const key = `Semana ${Math.min(weekNum, 4)}`;
        weeklyTotals[key] = (weeklyTotals[key] || 0) + Number(p.amount);
      });

      return Object.entries(weeklyTotals).map(([name, total]) => ({ name, total }));
    }
  }

  static async getPortfolioAging(): Promise<PortfolioAgingReport> {
    const now = new Date();

    // Traer todos los compromisos pendientes vencidos
    const overdueCommitments = await prisma.paymentCommitment.findMany({
      where: {
        status: "PENDIENTE",
        scheduledDate: {
          lt: now
        }
      },
      select: {
        amount: true,
        scheduledDate: true
      }
    });

    const brackets: AgingBracket[] = [
      { label: "0-30 días", amount: 0, count: 0 },
      { label: "31-60 días", amount: 0, count: 0 },
      { label: "61-90 días", amount: 0, count: 0 },
      { label: "90+ días", amount: 0, count: 0 }
    ];

    let totalOverdue = 0;

    overdueCommitments.forEach(c => {
      const amount = Number(c.amount);
      totalOverdue += amount;

      const diffTime = Math.abs(now.getTime() - c.scheduledDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        brackets[0].amount += amount;
        brackets[0].count++;
      } else if (diffDays <= 60) {
        brackets[1].amount += amount;
        brackets[1].count++;
      } else if (diffDays <= 90) {
        brackets[2].amount += amount;
        brackets[2].count++;
      } else {
        brackets[3].amount += amount;
        brackets[3].count++;
      }
    });

    return {
      brackets,
      totalOverdue
    };
  }
}
