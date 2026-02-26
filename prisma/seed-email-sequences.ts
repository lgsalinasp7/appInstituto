/**
 * Seed de Secuencias Automáticas de Email
 * Sistema de Email Marketing Automatizado - KaledSoft CRM
 *
 * Este seed crea las 4 secuencias automáticas del funnel de ventas
 */

import { PrismaClient, KaledTriggerType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEmailSequences() {
  console.log('🌱 Seeding email sequences...\n');

  // Obtener todas las plantillas para mapear sus IDs
  const templates = await prisma.kaledEmailTemplate.findMany({
    where: { isLibraryTemplate: true },
  });

  const getTemplateId = (name: string) => {
    const template = templates.find((t) => t.name === name);
    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }
    return template.id;
  };

  // ============================================
  // SECUENCIA A: Pre-Masterclass (3 emails)
  // ============================================
  try {
    const seqA = await prisma.kaledEmailSequence.upsert({
      where: { name: 'Pre-Masterclass Nurturing' },
      update: {
        triggerType: 'STAGE_BASED' as KaledTriggerType,
        triggerConfig: {
          targetStage: 'applied',
          description: 'Se activa cuando el lead aplica a la masterclass',
        },
        isActive: true,
      },
      create: {
        name: 'Pre-Masterclass Nurturing',
        triggerType: 'STAGE_BASED' as KaledTriggerType,
        triggerConfig: {
          targetStage: 'applied',
          description: 'Se activa cuando el lead aplica a la masterclass',
        },
        isActive: true,
      },
    });
    console.log('✅ Created/Updated: Pre-Masterclass Nurturing');

    // Borrar steps existentes
    await prisma.kaledEmailSequenceStep.deleteMany({
      where: { sequenceId: seqA.id },
    });

    // Crear steps
    await prisma.kaledEmailSequenceStep.createMany({
      data: [
        {
          sequenceId: seqA.id,
          templateId: getTemplateId('Fase 1 - Email 1: Confirmación Inmediata'),
          orderIndex: 0,
          delayHours: 0, // Inmediato
        },
        {
          sequenceId: seqA.id,
          templateId: getTemplateId('Fase 1 - Email 2: Construcción de Tensión'),
          orderIndex: 1,
          delayHours: 24, // +24h
        },
        {
          sequenceId: seqA.id,
          templateId: getTemplateId('Fase 1 - Email 3: Prueba Social'),
          orderIndex: 2,
          delayHours: 48, // +48h antes del evento (configurar manualmente según fecha)
        },
      ],
    });
    console.log('  └─ Added 3 steps\n');
  } catch (error) {
    console.error('❌ Error with Pre-Masterclass sequence:', error);
  }

  // ============================================
  // SECUENCIA B: Event Reminders (2 emails)
  // ============================================
  try {
    const seqB = await prisma.kaledEmailSequence.upsert({
      where: { name: 'Event Reminders' },
      update: {
        triggerType: 'TIME_BASED' as KaledTriggerType,
        triggerConfig: {
          triggerDate: 'eventDate',
          description: 'Se activa basándose en la fecha del evento de la campaña',
        },
        isActive: true,
      },
      create: {
        name: 'Event Reminders',
        triggerType: 'TIME_BASED' as KaledTriggerType,
        triggerConfig: {
          triggerDate: 'eventDate',
          description: 'Se activa basándose en la fecha del evento de la campaña',
        },
        isActive: true,
      },
    });
    console.log('✅ Created/Updated: Event Reminders');

    await prisma.kaledEmailSequenceStep.deleteMany({
      where: { sequenceId: seqB.id },
    });

    await prisma.kaledEmailSequenceStep.createMany({
      data: [
        {
          sequenceId: seqB.id,
          templateId: getTemplateId('Fase 2 - Email 4: Día del Evento'),
          orderIndex: 0,
          delayHours: -8, // 8 horas antes (día del evento a las 8am)
        },
        {
          sequenceId: seqB.id,
          templateId: getTemplateId('Fase 2 - Email 5: 1 Hora Antes'),
          orderIndex: 1,
          delayHours: -1, // 1 hora antes
        },
      ],
    });
    console.log('  └─ Added 2 steps\n');
  } catch (error) {
    console.error('❌ Error with Event Reminders sequence:', error);
  }

  // ============================================
  // SECUENCIA C: Sales Sequence - Attended (4 emails)
  // ============================================
  try {
    const seqC = await prisma.kaledEmailSequence.upsert({
      where: { name: 'Sales Sequence - Attended' },
      update: {
        triggerType: 'STAGE_BASED' as KaledTriggerType,
        triggerConfig: {
          targetStage: 'attended',
          description: 'Se activa cuando el lead asiste a la masterclass',
        },
        isActive: true,
      },
      create: {
        name: 'Sales Sequence - Attended',
        triggerType: 'STAGE_BASED' as KaledTriggerType,
        triggerConfig: {
          targetStage: 'attended',
          description: 'Se activa cuando el lead asiste a la masterclass',
        },
        isActive: true,
      },
    });
    console.log('✅ Created/Updated: Sales Sequence - Attended');

    await prisma.kaledEmailSequenceStep.deleteMany({
      where: { sequenceId: seqC.id },
    });

    await prisma.kaledEmailSequenceStep.createMany({
      data: [
        {
          sequenceId: seqC.id,
          templateId: getTemplateId('Fase 3 - Email 6: Oferta Inmediata'),
          orderIndex: 0,
          delayHours: 0, // Inmediato
        },
        {
          sequenceId: seqC.id,
          templateId: getTemplateId('Fase 3 - Email 7: Urgencia Suave'),
          orderIndex: 1,
          delayHours: 24, // +24h
        },
        {
          sequenceId: seqC.id,
          templateId: getTemplateId('Fase 3 - Email 8: Objeción Económica'),
          orderIndex: 2,
          delayHours: 72, // +3 días
        },
        {
          sequenceId: seqC.id,
          templateId: getTemplateId('Fase 3 - Email 9: Último Aviso'),
          orderIndex: 3,
          delayHours: 168, // +7 días
        },
      ],
    });
    console.log('  └─ Added 4 steps\n');
  } catch (error) {
    console.error('❌ Error with Sales Sequence sequence:', error);
  }

  // ============================================
  // SECUENCIA D: No-Show Recovery (2 emails)
  // ============================================
  try {
    const seqD = await prisma.kaledEmailSequence.upsert({
      where: { name: 'No-Show Recovery' },
      update: {
        triggerType: 'STAGE_BASED' as KaledTriggerType,
        triggerConfig: {
          targetStage: 'no_show',
          description: 'Se activa cuando el lead no asiste a la masterclass',
        },
        isActive: true,
      },
      create: {
        name: 'No-Show Recovery',
        triggerType: 'STAGE_BASED' as KaledTriggerType,
        triggerConfig: {
          targetStage: 'no_show',
          description: 'Se activa cuando el lead no asiste a la masterclass',
        },
        isActive: true,
      },
    });
    console.log('✅ Created/Updated: No-Show Recovery');

    await prisma.kaledEmailSequenceStep.deleteMany({
      where: { sequenceId: seqD.id },
    });

    await prisma.kaledEmailSequenceStep.createMany({
      data: [
        {
          sequenceId: seqD.id,
          templateId: getTemplateId('Fase 4 - Email NS-1: Te lo Perdiste'),
          orderIndex: 0,
          delayHours: 0, // Inmediato
        },
        {
          sequenceId: seqD.id,
          templateId: getTemplateId('Fase 4 - Email NS-2: Última Oportunidad Grabación'),
          orderIndex: 1,
          delayHours: 24, // +24h
        },
      ],
    });
    console.log('  └─ Added 2 steps\n');
  } catch (error) {
    console.error('❌ Error with No-Show Recovery sequence:', error);
  }

  console.log('✨ Email sequences seeded successfully!\n');
}

seedEmailSequences()
  .catch((e) => {
    console.error('❌ Error seeding sequences:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
