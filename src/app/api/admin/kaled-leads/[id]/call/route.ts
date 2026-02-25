/**
 * KaledLead Call Log API Route
 * POST /api/admin/kaled-leads/[id]/call
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import { z } from 'zod';

const callSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido'),
  duration: z.number().positive().optional(),
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

      return NextResponse.json({
        success: true,
        data: interaction,
        message: 'Llamada registrada correctamente',
      });
    } catch (error: any) {
      console.error('Error logging call:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al registrar la llamada',
        },
        { status: 500 }
      );
    }
  }
);
