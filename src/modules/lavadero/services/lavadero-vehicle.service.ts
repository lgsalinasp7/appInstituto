/**
 * Servicio de vehículos del Lavadero Pro
 */
import { prisma } from "@/lib/prisma";
import type { CreateVehicleInput, UpdateVehicleInput } from "../schemas";

export async function listVehicles(
  tenantId: string,
  search?: string,
  customerId?: string,
  page = 1,
  limit = 20
) {
  const where: Record<string, unknown> = { tenantId };
  if (search) {
    where.plate = { contains: search.toUpperCase(), mode: "insensitive" };
  }
  if (customerId) {
    where.customerId = customerId;
  }

  const [vehicles, total] = await Promise.all([
    prisma.lavaderoVehicle.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lavaderoVehicle.count({ where }),
  ]);

  return { vehicles, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getVehicleById(id: string, tenantId: string) {
  return prisma.lavaderoVehicle.findFirst({
    where: { id, tenantId },
    include: { customer: true },
  });
}

export async function findByPlate(plate: string, tenantId: string) {
  return prisma.lavaderoVehicle.findFirst({
    where: { plate: plate.toUpperCase(), tenantId },
    include: { customer: true },
  });
}

export async function createVehicle(data: CreateVehicleInput, tenantId: string) {
  return prisma.lavaderoVehicle.create({
    data: {
      plate: data.plate.toUpperCase(),
      type: data.type,
      color: data.color,
      brand: data.brand,
      customerId: data.customerId,
      tenantId,
    },
    include: { customer: true },
  });
}

export async function updateVehicle(id: string, data: UpdateVehicleInput, tenantId: string) {
  const vehicle = await prisma.lavaderoVehicle.findFirst({ where: { id, tenantId } });
  if (!vehicle) throw new Error("Vehículo no encontrado");

  return prisma.lavaderoVehicle.update({
    where: { id },
    data: {
      ...data,
      plate: data.plate ? data.plate.toUpperCase() : undefined,
    },
    include: { customer: true },
  });
}

export async function deleteVehicle(id: string, tenantId: string) {
  const vehicle = await prisma.lavaderoVehicle.findFirst({ where: { id, tenantId } });
  if (!vehicle) throw new Error("Vehículo no encontrado");

  return prisma.lavaderoVehicle.delete({ where: { id } });
}
