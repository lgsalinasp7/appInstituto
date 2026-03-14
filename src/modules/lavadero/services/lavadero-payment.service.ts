/**
 * Servicio de pagos del Lavadero Pro
 */
import { prisma } from "@/lib/prisma";
import type { CreatePaymentInput } from "../schemas";

export async function createPayment(
  data: CreatePaymentInput,
  userId: string,
  tenantId: string
) {
  const order = await prisma.lavaderoOrder.findFirst({
    where: { id: data.orderId, tenantId },
    include: { payments: true },
  });
  if (!order) throw new Error("Orden no encontrada");

  const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(order.total) - totalPaid;

  if (data.amount > remaining) {
    throw new Error(`El monto excede el saldo pendiente ($${remaining.toLocaleString("es-CO")})`);
  }

  const payment = await prisma.lavaderoPayment.create({
    data: {
      orderId: data.orderId,
      method: data.method,
      amount: data.amount,
      createdBy: userId,
      tenantId,
    },
    include: { order: true },
  });

  // Auto-mark as DELIVERED if fully paid
  const newTotalPaid = totalPaid + data.amount;
  if (newTotalPaid >= Number(order.total) && order.status !== "DELIVERED") {
    await prisma.lavaderoOrder.update({
      where: { id: data.orderId },
      data: { status: "DELIVERED" },
    });
  }

  return payment;
}

export async function listPayments(
  tenantId: string,
  filters?: { dateFrom?: Date; dateTo?: Date; page?: number; limit?: number }
) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const where: Record<string, unknown> = { tenantId };

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  const [payments, total] = await Promise.all([
    prisma.lavaderoPayment.findMany({
      where,
      include: {
        order: { include: { customer: true, vehicle: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lavaderoPayment.count({ where }),
  ]);

  return { payments, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getDailySummary(tenantId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const payments = await prisma.lavaderoPayment.findMany({
    where: {
      tenantId,
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const breakdown: Record<string, { total: number; count: number }> = {};
  let totalRevenue = 0;

  for (const p of payments) {
    const method = p.method;
    if (!breakdown[method]) breakdown[method] = { total: 0, count: 0 };
    const amount = Number(p.amount);
    breakdown[method].total += amount;
    breakdown[method].count += 1;
    totalRevenue += amount;
  }

  return {
    date: startOfDay.toISOString().split("T")[0],
    totalOrders: payments.length,
    totalRevenue,
    paymentBreakdown: Object.entries(breakdown).map(([method, data]) => ({
      method,
      ...data,
    })),
  };
}
