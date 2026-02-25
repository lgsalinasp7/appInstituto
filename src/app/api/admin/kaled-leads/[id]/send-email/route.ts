/**
 * Send Email to Lead API Route
 * POST /api/admin/kaled-leads/[id]/send-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledEmailService } from '@/modules/kaled-crm/services/kaled-email.service';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import { z } from 'zod';

const sendEmailSchema = z.object({
  templateId: z.string().optional(),
  subject: z.string().optional(),
  htmlContent: z.string().optional(),
  manual: z.boolean().optional(),
});

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
      const leadId = params.id;

      if (!leadId) {
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
      const validation = sendEmailSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const { templateId, subject, htmlContent, manual } = validation.data;

      let emailLog;

      if (manual && subject && htmlContent) {
        // Email manual sin plantilla
        emailLog = await KaledEmailService.sendManualEmail(
          leadId,
          subject,
          htmlContent
        );
      } else if (templateId) {
        // Email con plantilla
        emailLog = await KaledEmailService.sendAutomaticEmail(
          leadId,
          templateId
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error:
              'Debes proporcionar una plantilla o el contenido del email',
          },
          { status: 400 }
        );
      }

      // Registrar interacción
      await KaledInteractionService.logEmail(leadId, user.id, emailLog.id);

      return NextResponse.json({
        success: true,
        data: emailLog,
        message: 'Email enviado correctamente',
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al enviar el email',
        },
        { status: 500 }
      );
    }
  }
);
