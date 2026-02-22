/**
 * Script para verificar tokens registrados de Groq
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verificando mensajes de Groq...\n");

  // Buscar mensajes con modelo Groq
  const messages = await prisma.aiMessage.findMany({
    where: {
      modelUsed: "llama-3.3-70b-versatile",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      role: true,
      content: true,
      modelUsed: true,
      inputTokens: true,
      outputTokens: true,
      totalTokens: true,
      costInCents: true,
      createdAt: true,
    },
  });

  if (messages.length === 0) {
    console.log("❌ No se encontraron mensajes con Groq");
    console.log("   Esto significa que no se están registrando los tokens");
    return;
  }

  console.log(`✅ Encontrados ${messages.length} mensajes con Groq:\n`);

  messages.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.role}] - ${msg.createdAt.toLocaleString()}`);
    console.log(`   Contenido: ${msg.content?.substring(0, 80)}...`);
    console.log(`   📊 Tokens: ${msg.totalTokens} (input: ${msg.inputTokens}, output: ${msg.outputTokens})`);
    console.log(`   💰 Costo: ${msg.costInCents} centavos COP`);
    console.log("");
  });

  // Estadísticas generales
  const totalTokens = messages.reduce((sum, m) => sum + (m.totalTokens || 0), 0);
  const totalCost = messages.reduce((sum, m) => sum + (m.costInCents || 0), 0);

  console.log("📈 Estadísticas:");
  console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Costo total: ${totalCost} centavos COP (${(totalCost / 100).toFixed(2)} COP)`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
