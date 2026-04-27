/**
 * Servicio de clientes del Lavadero Pro
 */
import { prisma } from "@/lib/prisma";
import type { CreateCustomerInput, UpdateCustomerInput } from "../schemas";

export async function listCustomers(
  tenantId: string,
  search?: string,
  page = 1,
  limit = 20
) {
  const where: Record<string, unknown> = { tenantId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.lavaderoCustomer.findMany({
      where,
      include: { vehicles: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lavaderoCustomer.count({ where }),
  ]);

  return { customers, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getCustomerById(id: string, tenantId: string) {
  return prisma.lavaderoCustomer.findFirst({
    where: { id, tenantId },
    include: { vehicles: true, orders: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
}

export async function createCustomer(data: CreateCustomerInput, tenantId: string) {
  return prisma.lavaderoCustomer.create({
    data: { ...data, tenantId },
    include: { vehicles: true },
  });
}

export async function updateCustomer(id: string, data: UpdateCustomerInput, tenantId: string) {
  const customer = await prisma.lavaderoCustomer.findFirst({ where: { id, tenantId } });
  if (!customer) throw new Error("Cliente no encontrado");

  return prisma.lavaderoCustomer.update({
    where: { id },
    data,
    include: { vehicles: true },
  });
}

export async function deleteCustomer(id: string, tenantId: string) {
  const customer = await prisma.lavaderoCustomer.findFirst({
    where: { id, tenantId },
  });
  if (!customer) throw new Error("Cliente no encontrado");

  return prisma.lavaderoCustomer.delete({ where: { id } });
}
