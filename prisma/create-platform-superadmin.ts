/**
 * Crea el SuperAdmin de PLATAFORMA para admin.kaledsoft.tech
 *
 * Requisitos para acceder a /admin:
 * - tenantId: null (usuario de plataforma, no de tenant)
 * - platformRole: SUPER_ADMIN
 *
 * Uso: npx tsx prisma/create-platform-superadmin.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "superadmin@kaledsoft.tech";
const PASSWORD = "Admin123!";

async function main() {
  console.log("Creando SuperAdmin de plataforma para admin.kaledsoft.tech...\n");

  const hashedPassword = await bcrypt.hash(PASSWORD, 12);

  const existing = await prisma.user.findUnique({
    where: { email: EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: EMAIL },
      data: {
        password: hashedPassword,
        platformRole: "SUPER_ADMIN",
        tenantId: null,
        roleId: null,
        isActive: true,
      },
    });
    console.log("Usuario actualizado con platformRole SUPER_ADMIN y tenantId null.");
  } else {
    await prisma.user.create({
      data: {
        email: EMAIL,
        password: hashedPassword,
        name: "Super Administrador",
        platformRole: "SUPER_ADMIN",
        tenantId: null,
        roleId: null,
        isActive: true,
      },
    });
    console.log("Usuario SuperAdmin creado.");
  }

  console.log("\n════════════════════════════════════════");
  console.log("  CREDENCIALES admin.kaledsoft.tech");
  console.log("════════════════════════════════════════");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log("════════════════════════════════════════");
  console.log("\nAcceder a: http://admin.localhost:3000/login (o admin.kaledsoft.tech)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
