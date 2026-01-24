import prisma from "@/lib/prisma";

export interface DashboardStats {
  todayRevenue: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  overdueAmount: number;
  activeStudents: number;
  revenueTrend: number; // Porcentaje comparado con mes anterior o ayer
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Consultas en paralelo
    const [
      todayPayments,
      monthlyPayments,
      overdueCommitments,
      activeStudentsCount,
      configGoal
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
      })
    ]);

    const todayRevenue = Number(todayPayments._sum.amount) || 0;
    const monthlyRevenue = Number(monthlyPayments._sum.amount) || 0;
    const overdueAmount = Number(overdueCommitments._sum.amount) || 0;
    const monthlyGoal = configGoal ? Number(configGoal.value) : 10000000; // 10M por defecto

    return {
      todayRevenue,
      monthlyRevenue,
      monthlyGoal,
      overdueAmount,
      activeStudents: activeStudentsCount,
      revenueTrend: 15.5, // Placeholder por ahora
    };
  }
}
