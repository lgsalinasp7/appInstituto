/**
 * KaledLead Note API Route
 * POST /api/admin/kaled-leads/[id]/note
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import { z } from 'zod';

const noteSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido'),
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
      const validation = noteSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const { content } = validation.data;

      // Crear nota
      const interaction = await KaledInteractionService.createNote(
        id,
        user.id,
        content
      );

      return NextResponse.json({
        success: true,
        data: interaction,
        message: 'Nota agregada correctamente',
      });
    } catch (error: any) {
      console.error('Error creating note:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al crear la nota',
        },
        { status: 500 }
      );
    }
  }
);
