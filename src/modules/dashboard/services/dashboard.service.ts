import prisma from "@/lib/prisma";

export interface DashboardStats {
  todayRevenue: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  overdueAmount: number;
  activeStudents: number;
  revenueTrend: number; // Porcentaje comparado con mes anterior o ayer
  revenueChart?: { name: string; total: number }[];
  methodStats?: { method: string; count: number; amount: number; percentage: number }[];
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate dates for charts (Last 30 days or current month weeks)
    // For simplicity, let's show last 4 weeks
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    // Consultas en paralelo
    const [
      todayPayments,
      monthlyPayments,
      overdueCommitments,
      activeStudentsCount,
      configGoal,
      paymentsByMethod,
      paymentsHistory
    ] = await Promise.all([
      // 1. Recaudo de hoy
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: today,
            lt: tomorrow,
          }
        },
        _sum: { amount: true }
      }),
      // 2. Recaudo del mes
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: startOfMonth,
          }
        },
        _sum: { amount: true }
      }),
      // 3. Cartera en mora (Compromisos vencidos)
      prisma.paymentCommitment.aggregate({
        where: {
          status: "PENDIENTE",
          scheduledDate: {
            lt: today
          }
        },
        _sum: { amount: true }
      }),
      // 4. Estudiantes activos
      prisma.student.count({
        where: { status: "MATRICULADO" }
      }),
      // 5. Meta mensual de SystemConfig
      prisma.systemConfig.findUnique({
        where: { key: "MONTHLY_GOAL" }
      }),
      // 6. Stats por método de pago (Mes actual)
      prisma.payment.groupBy({
        by: ['method'],
        where: {
          paymentDate: {
            gte: startOfMonth,
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      // 7. Historial de pagos para gráfico (Últimas 4 semanas)
      prisma.payment.findMany({
        where: {
          paymentDate: {
            gte: fourWeeksAgo
          }
        },
        select: {
          paymentDate: true,
          amount: true
        },
        orderBy: {
          paymentDate: 'asc'
        }
      })
    ]);

    const todayRevenue = Number(todayPayments._sum.amount) || 0;
    const monthlyRevenue = Number(monthlyPayments._sum.amount) || 0;
    const overdueAmount = Number(overdueCommitments._sum.amount) || 0;
    const monthlyGoal = configGoal ? Number(configGoal.value) : 10000000; // 10M por defecto

    // Process Revenue Chart (Weekly buckets)
    const revenueChart = this.processRevenueChart(paymentsHistory, fourWeeksAgo);

    // Process Method Stats
    const totalMethods = paymentsByMethod.reduce((acc, curr) => acc + curr._count.id, 0);
    const methodStats = paymentsByMethod.map(p => ({
      method: p.method,
      count: p._count.id,
      amount: Number(p._sum.amount),
      percentage: totalMethods > 0 ? Math.round((p._count.id / totalMethods) * 100) : 0
    }));

    return {
      todayRevenue,
      monthlyRevenue,
      monthlyGoal,
      overdueAmount,
      activeStudents: activeStudentsCount,
      revenueTrend: 15.5, // Placeholder por ahora, requeriría lógica comparativa más compleja
      revenueChart,
      methodStats
    };
  }

  private static processRevenueChart(payments: { paymentDate: Date; amount: any }[], startDate: Date) {
    // Agrupar por semanas (Semana 1, Semana 2, etc, desde start date)
    const weeks: Record<string, number> = {
      "Semana 1": 0,
      "Semana 2": 0,
      "Semana 3": 0,
      "Semana 4": 0
    };

    payments.forEach(p => {
      const diffTime = Math.abs(p.paymentDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let weekKey = "Semana 4";
      if (diffDays <= 7) weekKey = "Semana 1";
      else if (diffDays <= 14) weekKey = "Semana 2";
      else if (diffDays <= 21) weekKey = "Semana 3";

      weeks[weekKey] += Number(p.amount);
    });

    return Object.entries(weeks).map(([name, total]) => ({ name, total }));
  }
}
