/**
 * KaledLead Call Log API Route
 * POST /api/admin/kaled-leads/[id]/call
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import { z } from 'zod';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

const callSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido'),
  duration: z.number().positive().optional(),
});

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, "admin_kaled_lead_call", undefined, { userId: user.id });
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

      const body = await request.json();

      // Validar datos
      const validation = callSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const { content, duration } = validation.data;

      // Registrar llamada
      const interaction = await KaledInteractionService.logCall(
        id,
        user.id,
        content,
        duration
      );

      logApiSuccess(ctx, "admin_kaled_lead_call", { duration: Date.now() - startedAt, resultId: id });
      return NextResponse.json({
        success: true,
        data: interaction,
        message: 'Llamada registrada correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_kaled_lead_call", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al registrar la llamada',
        },
        { status: 500 }
      );
    }
  }
);
