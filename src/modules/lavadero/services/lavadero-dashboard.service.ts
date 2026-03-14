/**
 * Servicio de dashboard / métricas del Lavadero Pro
 */
import { prisma } from "@/lib/prisma";
import type { LavaderoDashboardMetrics } from "../types";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardMetrics(
  tenantId: string
): Promise<LavaderoDashboardMetrics> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [todayPayments, weekPayments, monthPayments, pendingOrders, todayOrders, serviceStats, paymentStats] =
    await Promise.all([
      // Revenue today
      prisma.lavaderoPayment.findMany({
        where: { tenantId, createdAt: { gte: todayStart } },
        select: { amount: true },
      }),
      // Revenue this week
      prisma.lavaderoPayment.findMany({
        where: { tenantId, createdAt: { gte: weekStart } },
        select: { amount: true },
      }),
      // Revenue this month
      prisma.lavaderoPayment.findMany({
        where: { tenantId, createdAt: { gte: monthStart } },
        select: { amount: true },
      }),
      // Pending orders (not delivered)
      prisma.lavaderoOrder.count({
        where: { tenantId, status: { not: "DELIVERED" } },
      }),
      // Today's orders
      prisma.lavaderoOrder.count({
        where: { tenantId, createdAt: { gte: todayStart } },
      }),
      // Service popularity (last 30 days)
      prisma.lavaderoOrderService.groupBy({
        by: ["serviceId"],
        where: {
          order: { tenantId, createdAt: { gte: monthStart } },
        },
        _count: { serviceId: true },
        orderBy: { _count: { serviceId: "desc" } },
        take: 10,
      }),
      // Payment method breakdown (this month)
      prisma.lavaderoPayment.groupBy({
        by: ["method"],
        where: { tenantId, createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
    ]);

  // Get service names for popularity
  const serviceIds = serviceStats.map((s) => s.serviceId);
  const services = await prisma.lavaderoService.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]));

  const sumAmounts = (payments: { amount: unknown }[]) =>
    payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    todayRevenue: sumAmounts(todayPayments),
    weekRevenue: sumAmounts(weekPayments),
    monthRevenue: sumAmounts(monthPayments),
    pendingOrders,
    todayOrders,
    servicePopularity: serviceStats.map((s) => ({
      name: serviceNameMap.get(s.serviceId) ?? "Desconocido",
      count: s._count.serviceId,
    })),
    paymentBreakdown: paymentStats.map((p) => ({
      method: p.method,
      total: Number(p._sum.amount ?? 0),
    })),
  };
}
