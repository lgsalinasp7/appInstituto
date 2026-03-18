/**
 * Seed incremental EDUTEC — no borra datos. Idempotente (upsert).
 * Crea o actualiza tenant slug "edutec", branding, roles, 9 usuarios @edutec.edu.co,
 * 5 programas y MONTHLY_GOAL (mismo criterio que prisma/seed.ts para Edutec).
 *
 * Ejecutar: npm run db:seed-edutec-incremental
 * Producción: DATABASE_URL de prod + backup previo recomendado.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      if (line.startsWith("DATABASE_URL=")) {
        process.env.DATABASE_URL = line.replace("DATABASE_URL=", "").replace(/"/g, "").trim();
        break;
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found");
}

const prisma = new PrismaClient();

async function main() {
  console.log("=== SEED EDUTEC INCREMENTAL (sin wipe) ===\n");

  const tenant = await prisma.tenant.upsert({
    where: { slug: "edutec" },
    create: {
      name: "Instituto EDUTEC",
      slug: "edutec",
      status: "ACTIVO",
      plan: "PROFESIONAL",
      email: "admin@edutec.edu.co",
    },
    update: {
      name: "Instituto EDUTEC",
      status: "ACTIVO",
      plan: "PROFESIONAL",
      email: "admin@edutec.edu.co",
    },
  });
  console.log(`Tenant: ${tenant.name} (${tenant.slug}) id=${tenant.id}`);

  await prisma.tenantBranding.upsert({
    where: { tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      primaryColor: "#1e3a5f",
      secondaryColor: "#3b82f6",
      accentColor: "#10b981",
      fontFamily: "Inter",
      footerText: "Instituto EDUTEC - Educamos con Valores",
    },
    update: {
      primaryColor: "#1e3a5f",
      secondaryColor: "#3b82f6",
      accentColor: "#10b981",
      fontFamily: "Inter",
      footerText: "Instituto EDUTEC - Educamos con Valores",
    },
  });
  console.log("Branding OK");

  const superAdminRole = await prisma.role.upsert({
    where: { name_tenantId: { name: "SUPERADMIN", tenantId: tenant.id } },
    create: {
      name: "SUPERADMIN",
      description: "Super Administrador del Tenant",
      permissions: ["all"],
      tenantId: tenant.id,
    },
    update: {},
  });
  const adminRole = await prisma.role.upsert({
    where: { name_tenantId: { name: "ADMINISTRADOR", tenantId: tenant.id } },
    create: {
      name: "ADMINISTRADOR",
      description: "Administrador del sistema",
      permissions: ["all"],
      tenantId: tenant.id,
    },
    update: {},
  });
  const ventasRole = await prisma.role.upsert({
    where: { name_tenantId: { name: "VENTAS", tenantId: tenant.id } },
    create: {
      name: "VENTAS",
      description: "Ventas y Matriculas",
      permissions: ["dashboard", "matriculas"],
      tenantId: tenant.id,
    },
    update: {},
  });
  const carteraRole = await prisma.role.upsert({
    where: { name_tenantId: { name: "CARTERA", tenantId: tenant.id } },
    create: {
      name: "CARTERA",
      description: "Cartera y Recaudos",
      permissions: ["dashboard", "recaudos"],
      tenantId: tenant.id,
    },
    update: {},
  });
  console.log("4 roles OK");

  const tenantAdminPw = await bcrypt.hash("Admin123!", SALT_ROUNDS);
  const advisorPw = await bcrypt.hash("Asesor123!", SALT_ROUNDS);
  const recaudosPw = await bcrypt.hash("Recaudos123!", SALT_ROUNDS);

  type UserSpec = {
    email: string;
    name: string;
    roleId: string;
    password: string;
    invitationLimit?: number;
  };

  const userSpecs: UserSpec[] = [
    {
      email: "superadmin@edutec.edu.co",
      name: "Luis Salinas (Tenant)",
      roleId: superAdminRole.id,
      password: tenantAdminPw,
    },
    {
      email: "admin@edutec.edu.co",
      name: "Administrador EDUTEC",
      roleId: adminRole.id,
      password: tenantAdminPw,
      invitationLimit: 9,
    },
    { email: "asesor1@edutec.edu.co", name: "Asesor Comercial 1", roleId: ventasRole.id, password: advisorPw },
    { email: "asesor2@edutec.edu.co", name: "Asesor Comercial 2", roleId: ventasRole.id, password: advisorPw },
    { email: "asesor3@edutec.edu.co", name: "Asesor Comercial 3", roleId: ventasRole.id, password: advisorPw },
    { email: "maria.gonzalez@edutec.edu.co", name: "Maria Gonzalez", roleId: ventasRole.id, password: advisorPw },
    { email: "carlos.rodriguez@edutec.edu.co", name: "Carlos Rodriguez", roleId: ventasRole.id, password: advisorPw },
    { email: "recaudos1@edutec.edu.co", name: "Gestor Recaudos 1", roleId: carteraRole.id, password: recaudosPw },
    { email: "recaudos2@edutec.edu.co", name: "Gestor Recaudos 2", roleId: carteraRole.id, password: recaudosPw },
  ];

  let createdUsers = 0;
  let updatedUsers = 0;
  let skippedUsers = 0;

  for (const spec of userSpecs) {
    const existing = await prisma.user.findUnique({ where: { email: spec.email } });
    if (existing) {
      if (existing.tenantId !== tenant.id) {
        console.error(
          `  ⚠️  Omitido ${spec.email}: email ya existe con otro tenant (tenantId=${existing.tenantId})`,
        );
        skippedUsers++;
        continue;
      }
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: spec.name,
          roleId: spec.roleId,
          isActive: true,
          platformRole: null,
          invitationLimit: spec.invitationLimit ?? existing.invitationLimit,
          // No tocar password en usuarios ya existentes (prod).
        },
      });
      updatedUsers++;
    } else {
      await prisma.user.create({
        data: {
          email: spec.email,
          name: spec.name,
          roleId: spec.roleId,
          tenantId: tenant.id,
          isActive: true,
          password: spec.password,
          platformRole: null,
          invitationLimit: spec.invitationLimit ?? 0,
        },
      });
      createdUsers++;
    }
  }
  console.log(`Usuarios: +${createdUsers} creados, ${updatedUsers} actualizados, ${skippedUsers} omitidos`);

  const programsData = [
    { name: "Tecnico en Enfermeria", totalValue: 3500000, matriculaValue: 60000, modulesCount: 6 },
    { name: "Auxiliar en Salud Oral", totalValue: 2800000, matriculaValue: 60000, modulesCount: 6 },
    { name: "Tecnico en Farmacia", totalValue: 3200000, matriculaValue: 60000, modulesCount: 6 },
    { name: "Auxiliar Administrativo en Salud", totalValue: 2500000, matriculaValue: 50000, modulesCount: 6 },
    {
      name: "Tecnico en Atencion a la Primera Infancia",
      totalValue: 2900000,
      matriculaValue: 60000,
      modulesCount: 6,
    },
  ];

  for (const prog of programsData) {
    await prisma.program.upsert({
      where: {
        name_tenantId: { name: prog.name, tenantId: tenant.id },
      },
      create: {
        name: prog.name,
        totalValue: prog.totalValue,
        matriculaValue: prog.matriculaValue,
        modulesCount: prog.modulesCount,
        isActive: true,
        tenantId: tenant.id,
      },
      update: {
        totalValue: prog.totalValue,
        matriculaValue: prog.matriculaValue,
        modulesCount: prog.modulesCount,
        isActive: true,
      },
    });
  }
  console.log(`${programsData.length} programas OK`);

  await prisma.systemConfig.upsert({
    where: {
      key_tenantId: { key: "MONTHLY_GOAL", tenantId: tenant.id },
    },
    create: {
      key: "MONTHLY_GOAL",
      value: "50000000",
      tenantId: tenant.id,
    },
    update: { value: "50000000" },
  });
  console.log("SystemConfig MONTHLY_GOAL OK");

  console.log("\n=== LISTO ===");
  console.log("Validar: npm run db:validate-edutec-users");
  console.log("Login tenant: superadmin@edutec.edu.co / Admin123! (rotar en prod si aplica)\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
