/**
 * Servicio de bootstrap para tenants de tipo Lavadero Pro.
 * Crea los servicios default al desplegar un nuevo tenant.
 */
import { prisma } from "@/lib/prisma";
import { LAVADERO_DEFAULT_CONFIG } from "../config/lavadero-tenant.config";

export async function bootstrapLavaderoTenant(tenantId: string) {
  const existing = await prisma.lavaderoService.count({ where: { tenantId } });
  if (existing > 0) {
    return { created: 0, message: "El tenant ya tiene servicios configurados" };
  }

  const services = await prisma.lavaderoService.createMany({
    data: LAVADERO_DEFAULT_CONFIG.defaultServices.map((s) => ({
      name: s.name,
      price: s.price,
      tenantId,
    })),
  });

  return { created: services.count, message: `${services.count} servicios creados` };
}
