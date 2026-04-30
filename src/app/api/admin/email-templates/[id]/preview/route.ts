/**
 * Email Template Preview API Route
 * POST /api/admin/email-templates/[id]/preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledEmailService } from '@/modules/kaled-crm/services/kaled-email.service';
import { z } from 'zod';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

const previewSchema = z.object({
  variables: z.record(z.string(), z.string()),
});

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_email_templates_id_preview');
    const startedAt = Date.now();
    try {
      const params = await context!.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID de la plantilla es requerido',
          },
          { status: 400 }
        );
      }

      const body = await request.json();

      // Validar datos
      const validation = previewSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const rendered = await KaledEmailService.renderTemplate(
        id,
        validation.data.variables
      );

      logApiSuccess(ctx, 'admin_email_templates_id_preview', {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        data: rendered,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_email_templates_id_preview', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al previsualizar la plantilla',
        },
        { status: 500 }
      );
    }
  }
);
