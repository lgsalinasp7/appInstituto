/**
 * Servicio de catálogo de servicios del Lavadero Pro
 */
import { prisma } from "@/lib/prisma";
import type { CreateServiceInput, UpdateServiceInput } from "../schemas";

export async function listServices(tenantId: string, onlyActive = false) {
  const where: Record<string, unknown> = { tenantId };
  if (onlyActive) where.active = true;

  return prisma.lavaderoService.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getServiceById(id: string, tenantId: string) {
  return prisma.lavaderoService.findFirst({
    where: { id, tenantId },
  });
}

export async function createService(data: CreateServiceInput, tenantId: string) {
  return prisma.lavaderoService.create({
    data: {
      name: data.name,
      price: data.price,
      tenantId,
    },
  });
}

export async function updateService(id: string, data: UpdateServiceInput, tenantId: string) {
  const service = await prisma.lavaderoService.findFirst({ where: { id, tenantId } });
  if (!service) throw new Error("Servicio no encontrado");

  return prisma.lavaderoService.update({
    where: { id },
    data,
  });
}

export async function toggleServiceActive(id: string, tenantId: string) {
  const service = await prisma.lavaderoService.findFirst({ where: { id, tenantId } });
  if (!service) throw new Error("Servicio no encontrado");

  return prisma.lavaderoService.update({
    where: { id },
    data: { active: !service.active },
  });
}

export async function deleteService(id: string, tenantId: string) {
  const service = await prisma.lavaderoService.findFirst({ where: { id, tenantId } });
  if (!service) throw new Error("Servicio no encontrado");

  return prisma.lavaderoService.delete({ where: { id } });
}
