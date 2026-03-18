/**
 * Valida usuarios del tenant EDUTEC (slug: edutec).
 * Compara con el listado canónico de prisma/seed.ts y avisa duplicados @edutec.com.
 *
 * Ejecutar: npx tsx prisma/validate-edutec-users.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Usuarios que crea prisma/seed.ts (dominio edutec.edu.co) */
const SEED_EXPECTED: Array<{ email: string; roleName: string; note?: string }> = [
  { email: "superadmin@edutec.edu.co", roleName: "SUPERADMIN" },
  { email: "admin@edutec.edu.co", roleName: "ADMINISTRADOR" },
  { email: "asesor1@edutec.edu.co", roleName: "VENTAS" },
  { email: "asesor2@edutec.edu.co", roleName: "VENTAS" },
  { email: "asesor3@edutec.edu.co", roleName: "VENTAS" },
  { email: "maria.gonzalez@edutec.edu.co", roleName: "VENTAS" },
  { email: "carlos.rodriguez@edutec.edu.co", roleName: "VENTAS" },
  { email: "recaudos1@edutec.edu.co", roleName: "CARTERA" },
  { email: "recaudos2@edutec.edu.co", roleName: "CARTERA" },
];

/** Usuarios alternativos de prisma/create-edutec-users.ts (@edutec.com) */
const ALT_EDUTEC_COM = ["superadmin@edutec.com", "admin@edutec.com"];

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "edutec" },
    select: { id: true, name: true, slug: true, status: true },
  });

  if (!tenant) {
    console.error("❌ Tenant slug \"edutec\" no existe. Ejecuta prisma/seed.ts o crea el tenant.");
    process.exit(1);
  }

  console.log(`\n📌 Tenant: ${tenant.name} (${tenant.slug}) — status: ${tenant.status}\n`);

  const users = await prisma.user.findMany({
    where: { tenantId: tenant.id },
    include: { role: { select: { name: true } } },
    orderBy: { email: "asc" },
  });

  console.log(`Usuarios en BD con tenantId EDUTEC: ${users.length}\n`);

  const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

  let issues = 0;

  for (const exp of SEED_EXPECTED) {
    const u = byEmail.get(exp.email.toLowerCase());
    if (!u) {
      console.log(`  ⚠️  Falta: ${exp.email} (rol esperado: ${exp.roleName})`);
      issues++;
      continue;
    }
    const roleOk = u.role?.name === exp.roleName;
    const pwdOk = !!u.password?.length;
    const activeOk = u.isActive;
    const platformOk = u.platformRole == null;

    if (!roleOk) {
      console.log(`  ⚠️  ${exp.email}: rol BD="${u.role?.name ?? "sin rol"}" (esperado ${exp.roleName})`);
      issues++;
    }
    if (!pwdOk) {
      console.log(`  ⚠️  ${exp.email}: sin contraseña (no podrá login por password)`);
      issues++;
    }
    if (!activeOk) {
      console.log(`  ⚠️  ${exp.email}: isActive=false`);
      issues++;
    }
    if (!platformOk) {
      console.log(`  ⚠️  ${exp.email}: tiene platformRole=${u.platformRole} (tenant suele ir null)`);
      issues++;
    }
    if (roleOk && pwdOk && activeOk && platformOk) {
      console.log(`  ✓ ${exp.email} — ${exp.roleName}`);
    }
  }

  const seedEmails = new Set(SEED_EXPECTED.map((e) => e.email.toLowerCase()));
  const extra = users.filter((u) => !seedEmails.has(u.email.toLowerCase()));
  if (extra.length) {
    console.log(`\n📎 Usuarios EDUTEC adicionales (no en lista seed.ts):`);
    for (const u of extra) {
      console.log(
        `     ${u.email} — rol: ${u.role?.name ?? "—"} — active: ${u.isActive} — password: ${u.password ? "sí" : "no"}`
      );
    }
  }

  for (const alt of ALT_EDUTEC_COM) {
    if (byEmail.has(alt)) {
      console.log(
        `\nℹ️  Existe también ${alt} (script create-edutec-users.ts). Si solo quieres .edu.co, unifica cuentas.`
      );
    }
  }

  console.log("");
  if (issues === 0 && users.length >= SEED_EXPECTED.length) {
    console.log("✅ Validación EDUTEC: usuarios canónicos seed.ts OK.\n");
  } else if (issues > 0) {
    console.log(`⚠️  ${issues} incidencia(s). Re-ejecutar seed (solo si BD limpia) o prisma/create-edutec-users.ts / corregir en Prisma Studio.\n`);
  } else {
    console.log("ℹ️  Revisa usuarios faltantes arriba.\n");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
