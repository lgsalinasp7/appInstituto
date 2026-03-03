/**
 * Trigger Email Sequence for Lead API Route
 * POST /api/admin/kaled-leads/[id]/trigger-sequence
 *
 * Dispara la secuencia automática de emails según el estado actual del lead.
 * Útil para leads que no recibieron la secuencia al crearse (ej. re-registros,
 * secuencia creada después, o tenant distinto).
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { triggerSequenceByStage } from '@/modules/kaled-crm/services/kaled-automation.service';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
      const leadId = params.id;

      if (!leadId) {
        return NextResponse.json(
          { success: false, error: 'ID del lead es requerido' },
          { status: 400 }
        );
      }

      const lead = await prisma.kaledLead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        return NextResponse.json(
          { success: false, error: 'Lead no encontrado' },
          { status: 404 }
        );
      }

      const result = await triggerSequenceByStage(
        lead.id,
        lead.status,
        lead.tenantId ?? undefined
      );

      // Si el lead tiene tenantId y no se activó nada, intentar con secuencias de plataforma (tenantId null)
      let triggered = result.triggered;
      if (triggered === 0 && lead.tenantId) {
        const platformResult = await triggerSequenceByStage(
          lead.id,
          lead.status,
          undefined
        );
        triggered = platformResult.triggered;
      }

      return NextResponse.json({
        success: true,
        data: {
          triggered,
          message:
            triggered > 0
              ? `Secuencia activada. Se programaron los emails según el estado "${lead.status}". El cron los enviará en su horario.`
              : `No hay secuencias activas para el estado "${lead.status}". Revisa que exista una secuencia STAGE_BASED con targetStage="${lead.status}" y isActive=true.`,
        },
      });
    } catch (error: any) {
      console.error('Error triggering sequence:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al activar la secuencia',
        },
        { status: 500 }
      );
    }
  }
);
