/**
 * KaledSoft CRM - Email Automation Service
 *
 * Maneja la automatización de secuencias de emails basadas en:
 * - Cambios de estado del lead (STAGE_BASED)
 * - Eventos temporales (TIME_BASED)
 * - Acciones del lead (ACTION_BASED)
 *
 * También maneja scoring automático de leads
 */

import { prisma } from '@/lib/prisma';
import { KaledTriggerType } from '@prisma/client';

// ============================================
// Constantes de Scoring
// ============================================
const SCORING_RULES = {
  EMAIL_OPENED: 10,
  EMAIL_CLICKED: 20,
  MASTERCLASS_REGISTERED: 30,
  MASTERCLASS_ATTENDED: 40,
  CALL_SCHEDULED: 50,
  EMAIL_NOT_OPENED_48H: -10,
  PURCHASE: 100,
};

const INTEREST_LEVELS = {
  LOW: { min: 0, max: 30, label: 'low' },
  MEDIUM: { min: 31, max: 60, label: 'medium' },
  HIGH: { min: 61, max: 100, label: 'high' },
} as const;

// ============================================
// Trigger de Secuencias por Cambio de Estado
// ============================================

/**
 * Activa secuencias automáticas cuando un lead cambia de estado
 */
export async function triggerSequenceByStage(leadId: string, newStage: string, tenantId?: string) {
  try {
    console.log(`🔄 Triggering sequences for lead ${leadId} with stage: ${newStage}`);

    const where: any = {
      triggerType: 'STAGE_BASED' as KaledTriggerType,
      isActive: true,
    };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Buscar secuencias activas para este stage
    const sequences = await prisma.kaledEmailSequence.findMany({
      where,
      include: {
        steps: {
          include: {
            template: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    // Filtrar secuencias que coincidan con el stage
    const matchingSequences = sequences.filter((seq) => {
      const config = seq.triggerConfig as { targetStage?: string };
      return config.targetStage?.toLowerCase() === newStage.toLowerCase();
    });

    if (matchingSequences.length === 0) {
      console.log(`ℹ️ No sequences found for stage: ${newStage}`);
      return { triggered: 0 };
    }

    console.log(`✅ Found ${matchingSequences.length} sequences for stage: ${newStage}`);

    // Ejecutar cada secuencia
    for (const sequence of matchingSequences) {
      await executeSequence(leadId, sequence.id, tenantId);
    }

    return { triggered: matchingSequences.length };
  } catch (error) {
    console.error('❌ Error triggering sequence by stage:', error);
    throw error;
  }
}

/**
 * Ejecuta una secuencia de emails para un lead
 */
async function executeSequence(leadId: string, sequenceId: string, tenantId?: string) {
  try {
    const sequence = await prisma.kaledEmailSequence.findUnique({
      where: { id: sequenceId },
      include: {
        steps: {
          include: {
            template: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!sequence) {
      throw new Error(`Sequence not found: ${sequenceId}`);
    }

    const lead = await prisma.kaledLead.findUnique({
      where: { id: leadId },
      include: {
        campaign: true,
      },
    });

    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    console.log(`📧 Executing sequence "${sequence.name}" for lead ${lead.email}`);

    // Crear tareas de email para cada step
    for (const step of sequence.steps) {
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + step.delayHours);

      // Renderizar variables del template
      const renderedContent = renderTemplateVariables(
        step.template.htmlContent,
        lead,
        lead.campaign
      );
      const renderedSubject = renderTemplateVariables(step.template.subject, lead, lead.campaign);

      // Crear registro de email pendiente
      await prisma.kaledEmailLog.create({
        data: {
          to: lead.email,
          subject: renderedSubject,
          templateId: step.template.id,
          kaledLeadId: lead.id,
          status: step.delayHours === 0 ? 'PENDING' : 'SCHEDULED',
          metadata: {
            sequenceId: sequence.id,
            stepId: step.id,
            scheduledFor: scheduledFor.toISOString(),
            htmlContent: renderedContent,
          },
          tenantId: tenantId || lead.tenantId || null,
        },
      });

      console.log(
        `  ✓ Scheduled: ${step.template.name} (delay: ${step.delayHours}h) for ${scheduledFor.toLocaleString()}`
      );
    }

    // Actualizar lead con timestamp de última secuencia activada
    await prisma.kaledLead.update({
      where: { id: leadId },
      data: {
        updatedAt: new Date(),
      },
    });

    return { success: true, stepsScheduled: sequence.steps.length };
  } catch (error) {
    console.error('❌ Error executing sequence:', error);
    throw error;
  }
}

// ============================================
// Render de Variables de Template
// ============================================

/**
 * Renderiza las variables de un template con los datos del lead y campaña
 */
function renderTemplateVariables(
  content: string,
  lead: any,
  campaign: any | null
): string {
  let rendered = content;

  // Variables del lead
  rendered = rendered.replace(/{{Nombre}}/g, lead.name || '[Nombre]');
  rendered = rendered.replace(/{{Email}}/g, lead.email || '[Email]');
  rendered = rendered.replace(/{{Telefono}}/g, lead.phone || '[Teléfono]');

  // Variables de la campaña
  if (campaign) {
    // Formatear fecha
    const eventDate = campaign.eventDate
      ? new Date(campaign.eventDate).toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '[Fecha]';

    rendered = rendered.replace(/{{Fecha}}/g, eventDate);
    rendered = rendered.replace(/{{Hora}}/g, campaign.eventTime || '[Hora]');
    rendered = rendered.replace(/{{Enlace}}/g, campaign.eventUrl || '[Enlace]');
    rendered = rendered.replace(/{{LinkPago}}/g, campaign.checkoutUrl || '[LinkPago]');
    rendered = rendered.replace(/{{LinkCalendly}}/g, campaign.calendlyUrl || '[LinkCalendly]');
    rendered = rendered.replace(/{{LinkInscripcion}}/g, campaign.checkoutUrl || '[LinkInscripcion]');
    rendered = rendered.replace(/{{LinkGrabacion}}/g, campaign.recordingUrl || '[LinkGrabacion]');
    rendered = rendered.replace(/{{Link}}/g, campaign.eventUrl || '[Link]');
  } else {
    // Sin campaña, usar placeholders
    rendered = rendered.replace(/{{Fecha}}/g, '[Fecha]');
    rendered = rendered.replace(/{{Hora}}/g, '[Hora]');
    rendered = rendered.replace(/{{Enlace}}/g, '[Enlace]');
    rendered = rendered.replace(/{{LinkPago}}/g, '[LinkPago]');
    rendered = rendered.replace(/{{LinkCalendly}}/g, '[LinkCalendly]');
    rendered = rendered.replace(/{{LinkInscripcion}}/g, '[LinkInscripcion]');
    rendered = rendered.replace(/{{LinkGrabacion}}/g, '[LinkGrabacion]');
    rendered = rendered.replace(/{{Link}}/g, '[Link]');
  }

  return rendered;
}

// ============================================
// Lead Scoring
// ============================================

/**
 * Calcula y actualiza el lead score basado en comportamiento
 */
export async function calculateLeadScore(leadId: string): Promise<number> {
  try {
    const lead = await prisma.kaledLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    let score = 0;

    // Email engagement
    score += lead.emailOpens * SCORING_RULES.EMAIL_OPENED;
    score += lead.emailClicks * SCORING_RULES.EMAIL_CLICKED;

    // Masterclass engagement
    if (lead.masterclassRegisteredAt) {
      score += SCORING_RULES.MASTERCLASS_REGISTERED;
    }
    if (lead.masterclassAttendedAt) {
      score += SCORING_RULES.MASTERCLASS_ATTENDED;
    }

    // Purchase
    if (lead.purchasedAt) {
      score += SCORING_RULES.PURCHASE;
    }

    // Penalización por inactividad (emails no abiertos en 48h)
    if (lead.lastEmailSentAt) {
      const hoursSinceLastEmail =
        (Date.now() - new Date(lead.lastEmailSentAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastEmail > 48 && !lead.lastEmailOpenedAt) {
        score += SCORING_RULES.EMAIL_NOT_OPENED_48H;
      }
    }

    // Cap score entre 0-100
    score = Math.max(0, Math.min(100, score));

    // Actualizar lead score
    await prisma.kaledLead.update({
      where: { id: leadId },
      data: { leadScore: score },
    });

    console.log(`📊 Lead ${leadId} score updated: ${score}`);

    // Actualizar interest level automáticamente
    await updateInterestLevel(leadId, score);
    await ensureFollowupTaskForHighIntent(leadId, score);

    return score;
  } catch (error) {
    console.error('❌ Error calculating lead score:', error);
    throw error;
  }
}

async function ensureFollowupTaskForHighIntent(leadId: string, score: number) {
  if (score < INTEREST_LEVELS.HIGH.min) return;

  const lead = await prisma.kaledLead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      createdAt: true,
      status: true,
    },
  });

  if (!lead) return;
  if (['CONVERTIDO', 'PERDIDO'].includes(lead.status)) return;

  const hoursSinceCreated =
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);

  if (hoursSinceCreated < 24) return;

  const interactionCount = await prisma.kaledLeadInteraction.count({
    where: {
      kaledLeadId: leadId,
      type: { in: ['LLAMADA', 'WHATSAPP', 'REUNION'] },
    },
  });

  if (interactionCount > 0) return;

  const existingTask = await prisma.kaledLeadInteraction.findFirst({
    where: {
      kaledLeadId: leadId,
      type: 'TAREA',
      metadata: {
        path: ['autoTaskType'],
        equals: 'HIGH_INTENT_NO_CONTACT_24H',
      },
    },
    select: { id: true },
  });

  if (existingTask) return;

  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + 4);

  await prisma.kaledLeadInteraction.create({
    data: {
      type: 'TAREA',
      kaledLeadId: leadId,
      content:
        'Seguimiento prioritario: lead de alta intención sin gestión en 24h. Contactar hoy y mover a demo.',
      metadata: {
        autoTaskType: 'HIGH_INTENT_NO_CONTACT_24H',
        dueDate: dueDate.toISOString(),
        completed: false,
      },
    },
  });
}

/**
 * Actualiza el nivel de interés del lead basado en su score
 */
export async function updateInterestLevel(leadId: string, score?: number) {
  try {
    let leadScore = score;

    if (leadScore === undefined) {
      const lead = await prisma.kaledLead.findUnique({
        where: { id: leadId },
        select: { leadScore: true },
      });
      leadScore = lead?.leadScore || 0;
    }

    // Determinar interest level
    let interestLevel = 'low';
    if (leadScore >= INTEREST_LEVELS.HIGH.min) {
      interestLevel = 'high';
    } else if (leadScore >= INTEREST_LEVELS.MEDIUM.min) {
      interestLevel = 'medium';
    }

    // Actualizar lead
    await prisma.kaledLead.update({
      where: { id: leadId },
      data: { interestLevel },
    });

    console.log(`🎯 Lead ${leadId} interest level: ${interestLevel} (score: ${leadScore})`);

    return interestLevel;
  } catch (error) {
    console.error('❌ Error updating interest level:', error);
    throw error;
  }
}

// ============================================
// Email Tracking Handlers
// ============================================

/**
 * Maneja el evento de email abierto (llamado desde webhook)
 */
export async function handleEmailOpened(emailLogId: string, leadId: string) {
  try {
    // Actualizar email log
    await prisma.kaledEmailLog.update({
      where: { id: emailLogId },
      data: {
        status: 'OPENED',
        openedAt: new Date(),
        openCount: {
          increment: 1,
        },
      },
    });

    // Actualizar lead stats
    await prisma.kaledLead.update({
      where: { id: leadId },
      data: {
        emailOpens: {
          increment: 1,
        },
        lastEmailOpenedAt: new Date(),
      },
    });

    // Recalcular score
    await calculateLeadScore(leadId);

    console.log(`✅ Email opened event processed for lead ${leadId}`);
  } catch (error) {
    console.error('❌ Error handling email opened:', error);
    throw error;
  }
}

/**
 * Maneja el evento de click en email (llamado desde webhook)
 */
export async function handleEmailClicked(emailLogId: string, leadId: string) {
  try {
    // Actualizar email log
    await prisma.kaledEmailLog.update({
      where: { id: emailLogId },
      data: {
        status: 'CLICKED',
        clickedAt: new Date(),
        clickCount: {
          increment: 1,
        },
      },
    });

    // Actualizar lead stats
    await prisma.kaledLead.update({
      where: { id: leadId },
      data: {
        emailClicks: {
          increment: 1,
        },
        lastEmailClickedAt: new Date(),
      },
    });

    // Recalcular score
    await calculateLeadScore(leadId);

    console.log(`✅ Email clicked event processed for lead ${leadId}`);
  } catch (error) {
    console.error('❌ Error handling email clicked:', error);
    throw error;
  }
}

/**
 * Maneja el evento de email enviado (llamado desde webhook)
 */
export async function handleEmailDelivered(emailLogId: string) {
  try {
    await prisma.kaledEmailLog.update({
      where: { id: emailLogId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });

    console.log(`✅ Email delivered: ${emailLogId}`);
  } catch (error) {
    console.error('❌ Error handling email delivered:', error);
    throw error;
  }
}

/**
 * Maneja el evento de email rebotado (llamado desde webhook)
 */
export async function handleEmailBounced(emailLogId: string) {
  try {
    await prisma.kaledEmailLog.update({
      where: { id: emailLogId },
      data: {
        status: 'BOUNCED',
        bouncedAt: new Date(),
      },
    });

    console.log(`⚠️ Email bounced: ${emailLogId}`);
  } catch (error) {
    console.error('❌ Error handling email bounced:', error);
    throw error;
  }
}
