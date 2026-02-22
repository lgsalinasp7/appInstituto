// ============================================
// Lead Scoring Service
// Calcula y actualiza el score de leads (0-100)
// ============================================

import { prisma } from '@/lib/prisma';
import type { LeadTemperature } from '@prisma/client';

export class LeadScoringService {
  /**
   * Calcular score de un lead basado en múltiples factores
   *
   * Reglas de puntuación:
   * - Email proporcionado: +10
   * - Teléfono con código país: +10
   * - Programa seleccionado: +15
   * - Masterclass registrado: +20
   * - Masterclass asistió: +25
   * - Aplicación enviada (APLICACION stage): +30
   * - Respondió seguimiento (lastContactAt < 48h): +15
   * - Actividad reciente (updatedAt < 48h): +10
   * - Por cada interacción: +5 (max 25)
   */
  static async calculateScore(
    prospectId: string,
    tenantId: string
  ): Promise<number> {
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId, tenantId },
      include: {
        interactions: {
          select: { id: true },
        },
      },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    let score = 0;

    // Email proporcionado: +10
    if (prospect.email) {
      score += 10;
    }

    // Teléfono válido (mínimo 10 dígitos): +10
    if (prospect.phone && prospect.phone.replace(/\D/g, '').length >= 10) {
      score += 10;
    }

    // Programa seleccionado: +15
    if (prospect.programId) {
      score += 15;
    }

    // Masterclass registrado: +20
    if (prospect.masterclassRegisteredAt) {
      score += 20;
    }

    // Masterclass asistió: +25
    if (prospect.masterclassAttendedAt) {
      score += 25;
    }

    // En etapa de APLICACION o superior: +30
    const highStages = [
      'APLICACION',
      'LLAMADA_AGENDADA',
      'LLAMADA_REALIZADA',
      'NEGOCIACION',
      'MATRICULADO',
    ];
    if (highStages.includes(prospect.funnelStage)) {
      score += 30;
    }

    // Respondió seguimiento reciente (últimas 48h): +15
    if (prospect.lastContactAt) {
      const hoursSinceContact =
        (Date.now() - prospect.lastContactAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceContact < 48) {
        score += 15;
      }
    }

    // Actividad reciente (updatedAt < 48h): +10
    const hoursSinceUpdate =
      (Date.now() - prospect.updatedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 48) {
      score += 10;
    }

    // Por cada interacción: +5 (max 25 = 5 interacciones)
    const interactionBonus = Math.min(prospect.interactions.length * 5, 25);
    score += interactionBonus;

    // Cap score at 100
    score = Math.min(score, 100);

    // Actualizar score en BD
    await prisma.prospect.update({
      where: { id: prospectId },
      data: { score },
    });

    return score;
  }

  /**
   * Actualizar temperatura automáticamente según score
   * 0-30: FRIO
   * 31-60: TIBIO
   * 61+: CALIENTE
   */
  static async updateTemperature(
    prospectId: string,
    score: number,
    tenantId: string
  ): Promise<LeadTemperature> {
    let temperature: LeadTemperature;

    if (score <= 30) {
      temperature = 'FRIO';
    } else if (score <= 60) {
      temperature = 'TIBIO';
    } else {
      temperature = 'CALIENTE';
    }

    await prisma.prospect.update({
      where: { id: prospectId, tenantId },
      data: { temperature },
    });

    return temperature;
  }

  /**
   * Recalcular score y temperatura de un lead
   */
  static async recalculate(
    prospectId: string,
    tenantId: string
  ): Promise<{ score: number; temperature: LeadTemperature }> {
    const score = await this.calculateScore(prospectId, tenantId);
    const temperature = await this.updateTemperature(
      prospectId,
      score,
      tenantId
    );

    return { score, temperature };
  }

  /**
   * Recalcular scores de todos los leads de un tenant (batch)
   */
  static async recalculateAll(tenantId: string): Promise<number> {
    const prospects = await prisma.prospect.findMany({
      where: { tenantId },
      select: { id: true },
    });

    let updated = 0;

    for (const prospect of prospects) {
      try {
        await this.recalculate(prospect.id, tenantId);
        updated++;
      } catch (error) {
        console.error(
          `Error recalculating score for prospect ${prospect.id}:`,
          error
        );
      }
    }

    return updated;
  }
}
