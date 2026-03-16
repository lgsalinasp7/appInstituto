/**
 * Crea SOLO el tenant "kaledsoft" sin tocar ningún otro dato.
 * Útil cuando restauraste la BD y no tienes el tenant base.
 *
 * Ejecutar: npx tsx prisma/create-kaledsoft-tenant.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creando tenant KaledSoft (kaledsoft)...");

  const tenant = await prisma.tenant.upsert({
    where: { slug: "kaledsoft" },
    create: {
      name: "KaledSoft",
      slug: "kaledsoft",
      domain: "kaledsoft.tech",
      status: "ACTIVO",
      plan: "EMPRESARIAL",
      email: "gerente@kaledsoft.tech",
    },
    update: { status: "ACTIVO" },
  });

  console.log(`✓ Tenant listo: ${tenant.name} (${tenant.slug})`);
  console.log("  admin.localhost:3000/admin/leads debería funcionar ahora.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
