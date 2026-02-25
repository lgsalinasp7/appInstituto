/**
 * Email Template Individual API Routes
 * GET /api/admin/email-templates/[id] - Get template by ID
 * PUT /api/admin/email-templates/[id] - Update template
 * DELETE /api/admin/email-templates/[id] - Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledEmailService } from '@/modules/kaled-crm/services/kaled-email.service';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().optional(),
  subject: z.string().optional(),
  htmlContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/email-templates/[id]
export const GET = withPlatformAdmin(
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

      const template = await KaledEmailService.getTemplateById(id);

      if (!template) {
        return NextResponse.json(
          {
            success: false,
            error: 'Plantilla no encontrada',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: template,
      });
    } catch (error: any) {
      console.error('Error getting template:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener la plantilla',
        },
        { status: 500 }
      );
    }
  }
);

// PUT /api/admin/email-templates/[id]
export const PUT = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
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
      const validation = updateTemplateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const template = await KaledEmailService.updateTemplate(
        id,
        validation.data
      );

      return NextResponse.json({
        success: true,
        data: template,
        message: 'Plantilla actualizada correctamente',
      });
    } catch (error: any) {
      console.error('Error updating template:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al actualizar la plantilla',
        },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/email-templates/[id]
export const DELETE = withPlatformAdmin(
  ['SUPER_ADMIN'],
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

      await KaledEmailService.deleteTemplate(id);

      return NextResponse.json({
        success: true,
        message: 'Plantilla eliminada correctamente',
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al eliminar la plantilla',
        },
        { status: 500 }
      );
    }
  }
);
