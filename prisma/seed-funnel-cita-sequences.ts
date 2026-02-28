import { PrismaClient, KaledTriggerType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedFunnelCitaSequences() {
  console.log("Seeding funnel cita sequences...");

  const templates = await prisma.kaledEmailTemplate.findMany({
    where: { isLibraryTemplate: true },
    select: { id: true, name: true },
  });

  const getTemplateId = (name: string) => {
    const template = templates.find((item) => item.name === name);
    if (!template) throw new Error(`Template not found: ${name}`);
    return template.id;
  };

  const sequence = await prisma.kaledEmailSequence.upsert({
    where: { name: "Funnel Citas - CONTACTADO" },
    update: {
      triggerType: "STAGE_BASED" as KaledTriggerType,
      triggerConfig: {
        targetStage: "CONTACTADO",
        objective: "booked_calls",
      },
      isActive: true,
    },
    create: {
      name: "Funnel Citas - CONTACTADO",
      triggerType: "STAGE_BASED" as KaledTriggerType,
      triggerConfig: {
        targetStage: "CONTACTADO",
        objective: "booked_calls",
      },
      isActive: true,
    },
  });

  await prisma.kaledEmailSequenceStep.deleteMany({
    where: { sequenceId: sequence.id },
  });

  await prisma.kaledEmailSequenceStep.createMany({
    data: [
      {
        sequenceId: sequence.id,
        templateId: getTemplateId("Fase 1 - Email 1: Confirmación Inmediata"),
        orderIndex: 0,
        delayHours: 0,
      },
      {
        sequenceId: sequence.id,
        templateId: getTemplateId("Fase 1 - Email 2: Construcción de Tensión"),
        orderIndex: 1,
        delayHours: 24,
      },
      {
        sequenceId: sequence.id,
        templateId: getTemplateId("Fase 1 - Email 3: Prueba Social"),
        orderIndex: 2,
        delayHours: 72,
      },
    ],
  });

  console.log("Funnel Citas sequence seeded successfully.");
}

seedFunnelCitaSequences()
  .catch((error) => {
    console.error("Error seeding Funnel Citas sequence:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
