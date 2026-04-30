/**
 * KaledLead Restore API Route
 * POST /api/admin/kaled-leads/[id]/restore
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledLeadService } from '@/modules/masterclass/services/kaled-lead.service';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, "admin_kaled_lead_restore", undefined, { userId: user.id });
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

      // Restaurar lead
      const lead = await KaledLeadService.restoreLead(id);

      logApiSuccess(ctx, "admin_kaled_lead_restore", { duration: Date.now() - startedAt, resultId: id });
      return NextResponse.json({
        success: true,
        data: lead,
        message: 'Lead restaurado correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_kaled_lead_restore", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al restaurar el lead',
        },
        { status: 500 }
      );
    }
  }
);
