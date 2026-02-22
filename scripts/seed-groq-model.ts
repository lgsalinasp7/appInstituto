/**
 * Script para seedear el modelo Groq en la base de datos
 * Ejecutar: npx tsx scripts/seed-groq-model.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding Groq model...\n");

  // Crear o actualizar modelo Groq
  const groqModel = await prisma.aiModel.upsert({
    where: {
      modelIdentifier: "llama-3.3-70b-versatile",
    },
    create: {
      name: "Llama 3.3 70B Versatile",
      provider: "Groq",
      modelIdentifier: "llama-3.3-70b-versatile",
      freeTokensLimit: 15000000, // 15M tokens por día
      inputCostPer1k: 0.059, // $0.059 USD per 1M tokens = 0.000059 per 1k
      outputCostPer1k: 0.079, // $0.079 USD per 1M tokens = 0.000079 per 1k
      isActive: true,
      resetPeriod: "DAILY",
    },
    update: {
      name: "Llama 3.3 70B Versatile",
      provider: "Groq",
      freeTokensLimit: 15000000,
      inputCostPer1k: 0.059,
      outputCostPer1k: 0.079,
      isActive: true,
      resetPeriod: "DAILY",
    },
  });

  console.log("✅ Groq model created/updated:");
  console.log(JSON.stringify(groqModel, null, 2));
  console.log("\n📊 Free Tier Info:");
  console.log(`   - Free Tokens: ${groqModel.freeTokensLimit.toLocaleString()} tokens/día`);
  console.log(`   - Monthly Equivalent: ${(groqModel.freeTokensLimit * 30).toLocaleString()} tokens/mes`);
  console.log(`   - Reset Period: ${groqModel.resetPeriod}`);
  console.log(`   - Input Cost: $${groqModel.inputCostPer1k} per 1k tokens`);
  console.log(`   - Output Cost: $${groqModel.outputCostPer1k} per 1k tokens`);

  // Desactivar Gemini (temporal)
  const geminiModel = await prisma.aiModel.updateMany({
    where: {
      modelIdentifier: "gemini-2.0-flash",
    },
    data: {
      isActive: false,
    },
  });

  if (geminiModel.count > 0) {
    console.log("\n⚠️  Gemini model set to inactive (temporary)");
  }

  console.log("\n✅ Done! Groq is now the active model.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
