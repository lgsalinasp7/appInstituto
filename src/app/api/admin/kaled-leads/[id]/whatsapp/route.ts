/**
 * KaledLead WhatsApp Log API Route
 * POST /api/admin/kaled-leads/[id]/whatsapp
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const whatsappSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
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
      const validation = whatsappSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const { content, metadata } = validation.data;

      // Registrar mensaje de WhatsApp
      const interaction = await KaledInteractionService.logWhatsApp(
        id,
        user.id,
        content,
        metadata as Prisma.InputJsonObject | undefined
      );

      return NextResponse.json({
        success: true,
        data: interaction,
        message: 'Mensaje de WhatsApp registrado correctamente',
      });
    } catch (error: unknown) {
      console.error('Error logging WhatsApp:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al registrar el mensaje de WhatsApp',
        },
        { status: 500 }
      );
    }
  }
);
