/**
 * Script para actualizar los límites de Gemini 2.0 Flash a 250M tokens/mes
 * Ejecutar con: npx tsx scripts/update-gemini-limits.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔄 Actualizando límites de Gemini 2.0 Flash...\n');

  // Buscar el modelo Gemini
  const geminiModel = await prisma.aiModel.findUnique({
    where: { modelIdentifier: 'gemini-2.0-flash' }
  });

  if (!geminiModel) {
    console.log('❌ Modelo Gemini 2.0 Flash no encontrado');
    console.log('   Ejecuta primero: npm run seed');
    return;
  }

  console.log('📊 Valores actuales:');
  console.log(`   - Free Tier: ${geminiModel.freeTokensLimit.toLocaleString('es-CO')} tokens`);
  console.log(`   - Input Cost: $${geminiModel.inputCostPer1k} COP/1k`);
  console.log(`   - Output Cost: $${geminiModel.outputCostPer1k} COP/1k`);
  console.log(`   - Reset Period: ${geminiModel.resetPeriod}`);

  // Actualizar a 250M tokens gratis (según Google AI Studio)
  const updated = await prisma.aiModel.update({
    where: { modelIdentifier: 'gemini-2.0-flash' },
    data: {
      name: 'Gemini 2.5 Flash', // Actualizar también el nombre
      freeTokensLimit: 250000000, // 250M tokens
      inputCostPer1k: 0.000075 * 4000, // $0.075/1M = $0.000075/1k * 4000 COP/USD = 0.3 COP/1k
      outputCostPer1k: 0.0003 * 4000,   // $0.30/1M = $0.0003/1k * 4000 COP/USD = 1.2 COP/1k
      resetPeriod: 'MONTHLY',
    }
  });

  console.log('\n✅ Modelo actualizado:');
  console.log(`   - Nombre: ${updated.name}`);
  console.log(`   - Free Tier: ${updated.freeTokensLimit.toLocaleString('es-CO')} tokens`);
  console.log(`   - Input Cost: $${updated.inputCostPer1k} COP/1k ($${(Number(updated.inputCostPer1k)/4000).toFixed(6)}/1k USD)`);
  console.log(`   - Output Cost: $${updated.outputCostPer1k} COP/1k ($${(Number(updated.outputCostPer1k)/4000).toFixed(6)}/1k USD)`);
  console.log(`   - Reset Period: ${updated.resetPeriod}`);

  console.log('\n💡 Información adicional:');
  console.log('   - Free tier se reinicia cada mes (1° día del mes)');
  console.log('   - 250M tokens = suficiente para >1 año en la mayoría de perfiles');
  console.log('   - Ver tabla de referencia en: /admin/agentes/referencia\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
