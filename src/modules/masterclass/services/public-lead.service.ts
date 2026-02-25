/**
 * Public Lead Service
 * Captura de leads desde landing pages públicas
 */

import { prisma } from '@/lib/prisma';
import type { LeadRegistration } from '../types';
import { LeadScoringService } from '@/modules/funnel/services/lead-scoring.service';

export class PublicLeadService {
  /**
   * Capturar lead desde landing page pública
   * - Crea Prospect con source=LANDING_PAGE
   * - Registra interacción inicial
   * - Calcula score inicial
   * - Si hay masterclassSlug, actualiza funnelStage a MASTERCLASS_REGISTRADO
   */
  static async captureLead(data: LeadRegistration, tenantId: string): Promise<{ prospectId: string }> {
    // Verificar si ya existe el prospect por teléfono
    let prospect = await prisma.prospect.findFirst({
      where: {
        phone: data.phone,
        tenantId,
      },
    });

    // Compilar observaciones de la masterclass
    const masterclassNotes = [
      data.studyStatus ? `Estudio: ${data.studyStatus}` : null,
      data.programmingLevel ? `Nivel: ${data.programmingLevel}` : null,
      data.saasInterest ? `Interés SaaS: ${data.saasInterest}` : null,
      data.investmentReady ? `Inversión: ${data.investmentReady}` : null,
    ].filter(Boolean).join(' | ');

    // Si ya existe, actualizar información
    if (prospect) {
      prospect = await prisma.prospect.update({
        where: { id: prospect.id },
        data: {
          email: data.email || prospect.email,
          programId: data.programId || prospect.programId,
          utmSource: data.utmSource || prospect.utmSource,
          utmMedium: data.utmMedium || prospect.utmMedium,
          utmCampaign: data.utmCampaign || prospect.utmCampaign,
          funnelStage: data.masterclassSlug ? 'MASTERCLASS_REGISTRADO' : prospect.funnelStage,
          masterclassRegisteredAt: data.masterclassSlug ? new Date() : prospect.masterclassRegisteredAt,
          observations: masterclassNotes ? `${prospect.observations || ''}\n[MASTERCLASS]: ${masterclassNotes}`.trim() : prospect.observations,
        },
      });
    } else {
      // Obtener primer advisor del tenant
      const firstAdvisor = await prisma.user.findFirst({
        where: { tenantId },
        select: { id: true },
      });

      if (!firstAdvisor) {
        throw new Error('No hay asesores disponibles en el tenant');
      }

      // Crear nuevo prospect
      prospect = await prisma.prospect.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          source: 'LANDING_PAGE',
          funnelStage: data.masterclassSlug ? 'MASTERCLASS_REGISTRADO' : 'NUEVO',
          temperature: 'TIBIO',
          programId: data.programId,
          advisorId: firstAdvisor.id,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          masterclassRegisteredAt: data.masterclassSlug ? new Date() : null,
          observations: masterclassNotes ? `[MASTERCLASS]: ${masterclassNotes}` : null,
          tenantId,
        },
      });
    }

    // Crear interacción de registro
    await prisma.prospectInteraction.create({
      data: {
        prospectId: prospect.id,
        type: 'SISTEMA',
        content: data.masterclassSlug
          ? `Registrado a masterclass: ${data.masterclassSlug}`
          : 'Registro desde landing page',
        metadata: {
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          masterclassSlug: data.masterclassSlug,
          filteringAnswers: {
            studyStatus: data.studyStatus,
            programmingLevel: data.programmingLevel,
            saasInterest: data.saasInterest,
            investmentReady: data.investmentReady,
          }
        } as any,
        tenantId,
      },
    });

    // Calcular score inicial
    await LeadScoringService.calculateScore(prospect.id, tenantId);

    return { prospectId: prospect.id };
  }

  /**
   * Registrar asistencia a masterclass
   */
  static async markMasterclassAttended(prospectId: string, tenantId: string): Promise<void> {
    await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        funnelStage: 'MASTERCLASS_ASISTIO',
        masterclassAttendedAt: new Date(),
      },
    });

    await prisma.prospectInteraction.create({
      data: {
        prospectId,
        type: 'SISTEMA',
        content: 'Asistió a masterclass',
        tenantId,
      },
    });

    // Recalcular score
    await LeadScoringService.calculateScore(prospectId, tenantId);
  }
}
