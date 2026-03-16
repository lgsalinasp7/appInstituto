/**
 * Crea usuarios superadmin y admin para el tenant EDUTEC.
 * No borra datos existentes.
 *
 * Ejecutar: npx tsx prisma/create-edutec-users.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;
const PASSWORD = "Admin123!";

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "edutec" },
  });

  if (!tenant) {
    throw new Error('Tenant "edutec" no encontrado. Crea el tenant primero.');
  }

  console.log(`Tenant: ${tenant.name} (${tenant.slug})\n`);

  // Crear roles si no existen
  const superAdminRole = await prisma.role.upsert({
    where: {
      name_tenantId: { name: "SUPERADMIN", tenantId: tenant.id },
    },
    create: {
      name: "SUPERADMIN",
      description: "Super Administrador del Tenant",
      permissions: ["all"],
      tenantId: tenant.id,
    },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: {
      name_tenantId: { name: "ADMINISTRADOR", tenantId: tenant.id },
    },
    create: {
      name: "ADMINISTRADOR",
      description: "Administrador del sistema",
      permissions: ["all"],
      tenantId: tenant.id,
    },
    update: {},
  });

  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  // Crear usuarios
  await prisma.user.upsert({
    where: { email: "superadmin@edutec.com" },
    create: {
      email: "superadmin@edutec.com",
      name: "SuperAdmin EDUTEC",
      password: hashedPassword,
      isActive: true,
      tenantId: tenant.id,
      roleId: superAdminRole.id,
    },
    update: {
      password: hashedPassword,
      tenantId: tenant.id,
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@edutec.com" },
    create: {
      email: "admin@edutec.com",
      name: "Administrador EDUTEC",
      password: hashedPassword,
      isActive: true,
      tenantId: tenant.id,
      roleId: adminRole.id,
    },
    update: {
      password: hashedPassword,
      tenantId: tenant.id,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log("✓ Usuarios creados/actualizados:\n");
  console.log("  SuperAdmin: superadmin@edutec.com");
  console.log("  Admin:      admin@edutec.com");
  console.log(`  Password:   ${PASSWORD}\n`);
  console.log("  URL: https://edutec.kaledsoft.tech/auth/login\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
