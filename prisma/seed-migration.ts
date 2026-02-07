/**
 * Script de Migración de Datos - FASE 1
 * 
 * Este script debe ejecutarse DESPUÉS de correr las migraciones de Prisma:
 * 1. npx prisma migrate dev --name fase1_multi_tenant_schema
 * 2. npm run seed-migration
 * 
 * Realiza las siguientes tareas:
 * - Crea registros TenantBranding por defecto para tenants existentes
 * - Asigna platformRole a usuarios SuperAdmin sin tenant
 * - Valida que los datos existentes cumplen con los nuevos constraints
 */

import { PrismaClient, PlatformRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando migración de datos...\n");

  try {
    // 1. Crear TenantBranding para tenants existentes sin branding
    console.log("📊 Creando registros de TenantBranding para tenants existentes...");
    const tenantsWithoutBranding = await prisma.tenant.findMany({
      where: {
        branding: null,
      },
    });

    let brandingCreated = 0;
    for (const tenant of tenantsWithoutBranding) {
      await prisma.tenantBranding.create({
        data: {
          tenantId: tenant.id,
          primaryColor: "#1e3a5f",
          secondaryColor: "#3b82f6",
          accentColor: "#10b981",
          fontFamily: "Inter",
          darkMode: false,
          footerText: `© ${new Date().getFullYear()} ${tenant.name}. Todos los derechos reservados.`,
        },
      });
      brandingCreated++;
      console.log(`  ✅ Branding creado para tenant: ${tenant.name} (${tenant.slug})`);
    }
    console.log(`✨ ${brandingCreated} registros de branding creados\n`);

    // 2. Identificar y asignar platformRole a usuarios SuperAdmin
    console.log("👥 Asignando platformRole a usuarios de plataforma...");
    
    // Buscar usuarios que podrían ser SuperAdmin (con rol admin y sin tenant específico, o múltiples tenants)
    const potentialPlatformUsers = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ["admin", "ADMIN", "SuperAdmin", "SUPER_ADMIN"],
          },
        },
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    let platformUsersUpdated = 0;
    for (const user of potentialPlatformUsers) {
      // Si el usuario tiene rol de admin, considerarlo como usuario de plataforma
      if (user.role?.name?.toLowerCase().includes("admin") || user.role?.name?.toLowerCase().includes("super")) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            platformRole: PlatformRole.SUPER_ADMIN,
          },
        });
        platformUsersUpdated++;
        console.log(`  ✅ Usuario actualizado: ${user.email} -> SUPER_ADMIN`);
      }
    }
    console.log(`✨ ${platformUsersUpdated} usuarios de plataforma actualizados\n`);

    // 3. Validar constraints únicos por tenant
    console.log("🔍 Validando constraints únicos por tenant...");
    
    // Validar Roles
    const duplicateRoles = await prisma.$queryRaw<Array<{ name: string; tenantId: string; count: bigint }>>`
      SELECT name, "tenantId", COUNT(*) as count
      FROM "Role"
      GROUP BY name, "tenantId"
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateRoles.length > 0) {
      console.warn("⚠️  Se encontraron roles duplicados por tenant:");
      duplicateRoles.forEach(role => {
        console.warn(`  - ${role.name} en tenant ${role.tenantId}: ${role.count} duplicados`);
      });
      console.warn("  Por favor, corrija estos duplicados manualmente antes de continuar.\n");
    } else {
      console.log("  ✅ No se encontraron roles duplicados\n");
    }

    // Validar Programs
    const duplicatePrograms = await prisma.$queryRaw<Array<{ name: string; tenantId: string; count: bigint }>>`
      SELECT name, "tenantId", COUNT(*) as count
      FROM "Program"
      GROUP BY name, "tenantId"
      HAVING COUNT(*) > 1
    `;
    
    if (duplicatePrograms.length > 0) {
      console.warn("⚠️  Se encontraron programas duplicados por tenant:");
      duplicatePrograms.forEach(program => {
        console.warn(`  - ${program.name} en tenant ${program.tenantId}: ${program.count} duplicados`);
      });
      console.warn("  Por favor, corrija estos duplicados manualmente antes de continuar.\n");
    } else {
      console.log("  ✅ No se encontraron programas duplicados\n");
    }

    // Validar Students
    const duplicateStudents = await prisma.$queryRaw<Array<{ documentNumber: string; tenantId: string; count: bigint }>>`
      SELECT "documentNumber", "tenantId", COUNT(*) as count
      FROM "Student"
      GROUP BY "documentNumber", "tenantId"
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateStudents.length > 0) {
      console.warn("⚠️  Se encontraron estudiantes duplicados por tenant:");
      duplicateStudents.forEach(student => {
        console.warn(`  - Documento ${student.documentNumber} en tenant ${student.tenantId}: ${student.count} duplicados`);
      });
      console.warn("  Por favor, corrija estos duplicados manualmente antes de continuar.\n");
    } else {
      console.log("  ✅ No se encontraron estudiantes duplicados\n");
    }

    // Validar Payments/Receipts
    const duplicateReceipts = await prisma.$queryRaw<Array<{ receiptNumber: string; tenantId: string; count: bigint }>>`
      SELECT "receiptNumber", "tenantId", COUNT(*) as count
      FROM "Payment"
      GROUP BY "receiptNumber", "tenantId"
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateReceipts.length > 0) {
      console.warn("⚠️  Se encontraron números de recibo duplicados por tenant:");
      duplicateReceipts.forEach(receipt => {
        console.warn(`  - Recibo ${receipt.receiptNumber} en tenant ${receipt.tenantId}: ${receipt.count} duplicados`);
      });
      console.warn("  Por favor, corrija estos duplicados manualmente antes de continuar.\n");
    } else {
      console.log("  ✅ No se encontraron recibos duplicados\n");
    }

    // 4. Resumen final
    console.log("✅ Migración de datos completada exitosamente!\n");
    console.log("📋 Resumen:");
    console.log(`  - ${brandingCreated} registros de TenantBranding creados`);
    console.log(`  - ${platformUsersUpdated} usuarios de plataforma actualizados`);
    console.log(`  - ${duplicateRoles.length + duplicatePrograms.length + duplicateStudents.length + duplicateReceipts.length} problemas de duplicados encontrados\n`);

    if (duplicateRoles.length + duplicatePrograms.length + duplicateStudents.length + duplicateReceipts.length > 0) {
      console.log("⚠️  ATENCIÓN: Se encontraron duplicados que deben corregirse manualmente.");
      console.log("   Revise los logs anteriores y corrija los duplicados antes de continuar.\n");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
