/**
 * Servicio de órdenes del Lavadero Pro
 */
import { prisma } from "@/lib/prisma";
import type { LavaderoOrderStatus } from "@prisma/client";
import type { CreateOrderInput } from "../schemas";

const ORDER_INCLUDE = {
  vehicle: true,
  customer: true,
  orderServices: { include: { service: true } },
  payments: true,
  creator: { select: { id: true, name: true } },
} as const;

export async function listOrders(
  tenantId: string,
  filters?: {
    status?: LavaderoOrderStatus;
    dateFrom?: Date;
    dateTo?: Date;
    customerId?: string;
    page?: number;
    limit?: number;
  }
) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const where: Record<string, unknown> = { tenantId };

  if (filters?.status) where.status = filters.status;
  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  const [orders, total] = await Promise.all([
    prisma.lavaderoOrder.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lavaderoOrder.count({ where }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getOrderById(id: string, tenantId: string) {
  return prisma.lavaderoOrder.findFirst({
    where: { id, tenantId },
    include: ORDER_INCLUDE,
  });
}

export async function createOrder(
  data: CreateOrderInput,
  userId: string,
  tenantId: string
) {
  // Get services to snapshot prices
  const services = await prisma.lavaderoService.findMany({
    where: { id: { in: data.serviceIds }, tenantId, active: true },
  });

  if (services.length !== data.serviceIds.length) {
    throw new Error("Uno o más servicios no están disponibles");
  }

  const total = services.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );

  return prisma.lavaderoOrder.create({
    data: {
      vehicleId: data.vehicleId,
      customerId: data.customerId,
      total,
      notes: data.notes,
      createdBy: userId,
      tenantId,
      orderServices: {
        create: services.map((s) => ({
          serviceId: s.id,
          priceAtTime: s.price,
        })),
      },
    },
    include: ORDER_INCLUDE,
  });
}

export async function updateOrderStatus(
  id: string,
  status: LavaderoOrderStatus,
  tenantId: string
) {
  const order = await prisma.lavaderoOrder.findFirst({ where: { id, tenantId } });
  if (!order) throw new Error("Orden no encontrada");

  return prisma.lavaderoOrder.update({
    where: { id },
    data: { status },
    include: ORDER_INCLUDE,
  });
}
