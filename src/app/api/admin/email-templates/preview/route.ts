/**
 * Email Template Preview API Route
 * POST /api/admin/email-templates/preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { z } from 'zod';

const previewSchema = z.object({
  htmlContent: z.string(),
  variables: z.array(z.string()).optional().default([]),
});

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest) => {
    try {
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

      const { htmlContent, variables } = validation.data;

      // Replace variables with example data for preview
      let previewHtml = htmlContent;

      const exampleData: Record<string, string> = {
        nombre: 'Juan Pérez',
        email: 'juan.perez@example.com',
        telefono: '+57 300 123 4567',
        enlace: 'https://example.com',
      };

      variables.forEach((variable) => {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        const value = exampleData[variable] || `[${variable}]`;
        previewHtml = previewHtml.replace(regex, value);
      });

      return NextResponse.json({
        success: true,
        data: {
          html: previewHtml,
        },
      });
    } catch (error: any) {
      console.error('Error generating preview:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al generar vista previa',
        },
        { status: 500 }
      );
    }
  }
);
