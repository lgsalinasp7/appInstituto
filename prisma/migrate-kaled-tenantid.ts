/**
 * Script de migración de datos: Asigna tenantId a registros Kaled* existentes.
 *
 * Todos los registros sin tenantId se asignan al tenant con slug 'kaledsoft'.
 * Ejecutar después de la migración de schema:
 *   npx tsx prisma/migrate-kaled-tenantid.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migración de tenantId para modelos Kaled*...\n');

  // Buscar tenant kaledsoft
  const kaledTenant = await prisma.tenant.findUnique({
    where: { slug: 'kaledsoft' },
  });

  if (!kaledTenant) {
    console.error(
      '❌ Tenant "kaledsoft" no encontrado. Crea el tenant primero.'
    );
    console.log(
      '   Puedes crearlo manualmente o ejecutar el seed de la plataforma.'
    );
    process.exit(1);
  }

  console.log(`✅ Tenant encontrado: ${kaledTenant.name} (${kaledTenant.id})\n`);

  const models = [
    { name: 'KaledLead', table: 'KaledLead' },
    { name: 'KaledCampaign', table: 'KaledCampaign' },
    { name: 'KaledEmailTemplate', table: 'KaledEmailTemplate' },
    { name: 'KaledEmailSequence', table: 'KaledEmailSequence' },
    { name: 'KaledEmailLog', table: 'KaledEmailLog' },
    { name: 'KaledLeadInteraction', table: 'KaledLeadInteraction' },
    { name: 'KaledEmailSequenceStep', table: 'KaledEmailSequenceStep' },
  ];

  for (const model of models) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "${model.table}" SET "tenantId" = $1 WHERE "tenantId" IS NULL`,
      kaledTenant.id
    );
    console.log(`  📝 ${model.name}: ${result} registros actualizados`);
  }

  console.log('\n✅ Migración completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
