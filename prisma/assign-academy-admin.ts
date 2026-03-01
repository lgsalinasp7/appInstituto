/**
 * Asigna platformRole ACADEMY_ADMIN al usuario gerente@kaledsoft.tech
 * y lo asocia al tenant kaledacademy si aún no lo está.
 *
 * Uso: npx tsx prisma/assign-academy-admin.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "gerente@kaledsoft.tech";

  const kaledacademy = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
  });

  if (!kaledacademy) {
    console.error("Tenant kaledacademy no existe. Ejecuta primero el bootstrap de academia.");
    process.exit(1);
  }

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`Usuario ${email} no existe. Créalo primero o ejecuta el bootstrap de academia.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: {
      platformRole: "ACADEMY_ADMIN",
      tenantId: kaledacademy.id,
    },
  });

  console.log(`OK: ${email} tiene ahora platformRole ACADEMY_ADMIN y está en tenant kaledacademy.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
