/**
 * Email Template Preview API Route
 * POST /api/admin/email-templates/[id]/preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledEmailService } from '@/modules/kaled-crm/services/kaled-email.service';
import { z } from 'zod';

const previewSchema = z.object({
  variables: z.record(z.string(), z.string()),
});

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
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

      return NextResponse.json({
        success: true,
        data: rendered,
      });
    } catch (error: any) {
      console.error('Error previewing template:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al previsualizar la plantilla',
        },
        { status: 500 }
      );
    }
  }
);
