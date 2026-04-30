/**
 * KaledLead History API Route
 * GET /api/admin/kaled-leads/[id]/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledLeadService } from '@/modules/masterclass/services/kaled-lead.service';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, "admin_kaled_lead_history", undefined, { userId: user.id });
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID del lead es requerido',
          },
          { status: 400 }
        );
      }

      // Obtener historial de interacciones
      const history = await KaledLeadService.getLeadHistory(id);

      logApiSuccess(ctx, "admin_kaled_lead_history", {
        duration: Date.now() - startedAt,
        resultId: id,
        recordCount: Array.isArray(history) ? history.length : undefined,
      });
      return NextResponse.json({
        success: true,
        data: history,
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_kaled_lead_history", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al obtener el historial del lead',
        },
        { status: 500 }
      );
    }
  }
);
