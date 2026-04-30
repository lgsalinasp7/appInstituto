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
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, "admin_kaled_lead_trigger_sequence", undefined, { userId: user.id });
    const startedAt = Date.now();
    try {
      const params = await context!.params;
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

      // Tras 1.8 lead.tenantId es NOT NULL: dispara solo secuencias del tenant del lead.
      const result = await triggerSequenceByStage(
        lead.id,
        lead.status,
        lead.tenantId
      );
      const triggered = result.triggered;

      logApiSuccess(ctx, "admin_kaled_lead_trigger_sequence", {
        duration: Date.now() - startedAt,
        resultId: leadId,
        metadata: { triggered, status: lead.status },
      });
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
    } catch (error: unknown) {
      logApiError(ctx, "admin_kaled_lead_trigger_sequence", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al activar la secuencia',
        },
        { status: 500 }
      );
    }
  }
);
