/**
 * Seed standalone para crear/actualizar el ProductTemplate de Lavadero Pro.
 *
 * Ejecutar: npx tsx prisma/seed-lavadero-product-template.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LAVADERO_TEMPLATE = {
  name: "Lavadero Pro",
  slug: "lavadero-pro",
  description:
    "Sistema completo de gestión para lavaderos de autos. Incluye control de órdenes tipo Kanban, clientes, vehículos, facturación y notificaciones WhatsApp.",
  icon: "Car",
  primaryColor: "#0e7490",
  secondaryColor: "#06b6d4",
  accentColor: "#10b981",
  darkMode: false,
  footerText: "Lavadero Pro - Powered by KaledSoft",
  plan: "PROFESIONAL",
  allowPublicRegistration: false,
};

async function main() {
  console.log("Seeding Lavadero Pro ProductTemplate...\n");

  const existing = await prisma.productTemplate.findUnique({
    where: { slug: LAVADERO_TEMPLATE.slug },
  });

  if (existing) {
    await prisma.productTemplate.update({
      where: { slug: LAVADERO_TEMPLATE.slug },
      data: LAVADERO_TEMPLATE,
    });
    console.log("  Actualizado: Lavadero Pro");
  } else {
    await prisma.productTemplate.create({ data: LAVADERO_TEMPLATE });
    console.log("  Creado: Lavadero Pro");
  }

  console.log("\nLavadero Pro template listo.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
