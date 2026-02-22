/**
 * Script de Prueba - Sistema de Tracking de Agentes IA
 * Ejecutar con: npx tsx scripts/test-ai-tracking.ts
 */

import { PrismaClient } from '@prisma/client';
import { AiModelService } from '../src/modules/chat/services/ai-model.service';
import { AiAgentService } from '../src/modules/chat/services/ai-agent.service';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧪 Iniciando pruebas del Sistema de Tracking de IA...\n');

  // Test 1: Verificar que el modelo Gemini existe
  console.log('1️⃣  Verificando modelo Gemini 2.0 Flash...');
  const geminiModel = await AiModelService.getModelByIdentifier('gemini-2.0-flash');
  if (geminiModel) {
    console.log('   ✅ Modelo encontrado:');
    console.log(`      - ID: ${geminiModel.id}`);
    console.log(`      - Nombre: ${geminiModel.name}`);
    console.log(`      - Free Tier: ${geminiModel.freeTokensLimit.toLocaleString('es-CO')} tokens`);
    console.log(`      - Input: ${geminiModel.inputCostPer1k} COP/1k tokens`);
    console.log(`      - Output: ${geminiModel.outputCostPer1k} COP/1k tokens`);
  } else {
    console.log('   ❌ Modelo no encontrado. Ejecutar: npm run seed');
    return;
  }

  // Test 2: Calcular costo de ejemplo
  console.log('\n2️⃣  Calculando costo de ejemplo (500 input + 1500 output tokens)...');
  const cost = await AiModelService.calculateCost('gemini-2.0-flash', 500, 1500);
  console.log('   ✅ Costo calculado:');
  console.log(`      - Input: $${cost.inputCost.toFixed(6)} COP`);
  console.log(`      - Output: $${cost.outputCost.toFixed(6)} COP`);
  console.log(`      - Total: $${cost.totalCost.toFixed(6)} COP`);
  console.log(`      - En centavos: ${cost.costInCents}`);

  // Test 3: Verificar si hay mensajes con tokens
  console.log('\n3️⃣  Verificando mensajes con tracking de tokens...');
  const messagesWithTokens = await prisma.aiMessage.count({
    where: {
      totalTokens: { not: null }
    }
  });
  console.log(`   📊 Total de mensajes con tokens: ${messagesWithTokens}`);

  if (messagesWithTokens > 0) {
    const lastMessage = await prisma.aiMessage.findFirst({
      where: { totalTokens: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: {
        modelUsed: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        costInCents: true,
        createdAt: true,
      }
    });

    if (lastMessage) {
      console.log('   ✅ Último mensaje rastreado:');
      console.log(`      - Modelo: ${lastMessage.modelUsed}`);
      console.log(`      - Input: ${lastMessage.inputTokens?.toLocaleString('es-CO')} tokens`);
      console.log(`      - Output: ${lastMessage.outputTokens?.toLocaleString('es-CO')} tokens`);
      console.log(`      - Total: ${lastMessage.totalTokens?.toLocaleString('es-CO')} tokens`);
      console.log(`      - Costo: $${((lastMessage.costInCents || 0) / 100).toFixed(6)} COP`);
      console.log(`      - Fecha: ${lastMessage.createdAt.toLocaleString('es-CO')}`);
    }
  } else {
    console.log('   ⚠️  No hay mensajes con tokens aún. Usa el chat para generar datos.');
  }

  // Test 4: Obtener estadísticas del dashboard
  console.log('\n4️⃣  Obteniendo estadísticas del dashboard...');
  const stats = await AiAgentService.getAgentStats();
  console.log('   ✅ Estadísticas generales:');
  console.log(`      - Total Tokens: ${stats.totalTokens.toLocaleString('es-CO')}`);
  console.log(`      - Total Mensajes: ${stats.totalMessages.toLocaleString('es-CO')}`);
  console.log(`      - Costo Total: $${stats.totalCostCOP.toFixed(4)} COP`);
  console.log(`      - Modelos Activos: ${stats.activeModels}`);
  console.log('\n   📊 Free Tier:');
  console.log(`      - Usado: ${stats.freeTierUsage.used.toLocaleString('es-CO')} / ${stats.freeTierUsage.limit.toLocaleString('es-CO')}`);
  console.log(`      - Porcentaje: ${stats.freeTierUsage.percentage.toFixed(2)}%`);
  console.log(`      - Estado: ${stats.freeTierUsage.status.toUpperCase()}`);
  console.log(`      - Reinicia: ${stats.freeTierUsage.resetDate.toLocaleDateString('es-CO')}`);
  console.log('\n   📈 Tendencias (vs mes anterior):');
  console.log(`      - Tokens: ${stats.trends.tokensTrend > 0 ? '+' : ''}${stats.trends.tokensTrend.toFixed(1)}%`);
  console.log(`      - Mensajes: ${stats.trends.messagesTrend > 0 ? '+' : ''}${stats.trends.messagesTrend.toFixed(1)}%`);
  console.log(`      - Costo: ${stats.trends.costTrend > 0 ? '+' : ''}${stats.trends.costTrend.toFixed(1)}%`);

  // Test 5: Obtener top tenants
  console.log('\n5️⃣  Obteniendo top tenants...');
  const topTenants = await AiAgentService.getTopTenants(5);
  if (topTenants.length > 0) {
    console.log(`   ✅ Top ${topTenants.length} tenants por consumo:`);
    topTenants.forEach((tenant, index) => {
      console.log(`      ${index + 1}. ${tenant.tenantName} (${tenant.tenantSlug})`);
      console.log(`         - Tokens: ${tenant.totalTokens.toLocaleString('es-CO')}`);
      console.log(`         - Mensajes: ${tenant.totalMessages}`);
      console.log(`         - Costo: $${tenant.totalCost.toFixed(4)} COP`);
      console.log(`         - % del total: ${tenant.percentage.toFixed(1)}%`);
    });
  } else {
    console.log('   ℹ️  No hay datos de tenants aún.');
  }

  // Test 6: Verificar registros en AiUsage
  console.log('\n6️⃣  Verificando agregaciones en AiUsage...');
  const usageRecords = await prisma.aiUsage.count();
  console.log(`   📊 Total de registros de uso agregados: ${usageRecords}`);

  if (usageRecords > 0) {
    const latestUsage = await prisma.aiUsage.findFirst({
      orderBy: { updatedAt: 'desc' },
      include: {
        model: { select: { name: true } },
        tenant: { select: { name: true, slug: true } }
      }
    });

    if (latestUsage) {
      console.log('   ✅ Registro más reciente:');
      console.log(`      - Tenant: ${latestUsage.tenant?.name || 'Platform-wide'}`);
      console.log(`      - Modelo: ${latestUsage.model.name}`);
      console.log(`      - Período: ${latestUsage.period.toLocaleDateString('es-CO')}`);
      console.log(`      - Tokens: ${latestUsage.totalTokens.toLocaleString('es-CO')}`);
      console.log(`      - Mensajes: ${latestUsage.messagesCount}`);
      console.log(`      - Costo: $${(latestUsage.totalCostCents / 100).toFixed(4)} COP`);
    }
  }

  console.log('\n✅ Todas las pruebas completadas!\n');
  console.log('📌 Próximos pasos:');
  console.log('   1. Inicia el servidor: npm run dev');
  console.log('   2. Navega a: http://localhost:3000/admin/agentes');
  console.log('   3. Usa el chat para generar más datos');
  console.log('   4. Observa cómo se actualiza el dashboard\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error en las pruebas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
