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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Normalizes legacy inline light styles so previews match the app dark design system.
 * This only affects preview rendering and does not mutate stored templates.
 */
const normalizeLegacyPreviewStyles = (html: string) => {
  const styleReplacements: Array<[RegExp, string]> = [
    [/background-color:\s*#d1ecf1/gi, 'background-color: rgba(8, 145, 178, 0.2)'],
    [/background-color:\s*#d4edda/gi, 'background-color: rgba(5, 150, 105, 0.18)'],
    [/background-color:\s*#fff3cd/gi, 'background-color: rgba(245, 158, 11, 0.16)'],
    [/background-color:\s*#f8d7da/gi, 'background-color: rgba(244, 63, 94, 0.18)'],
    [/background-color:\s*#f8f9fa/gi, 'background-color: rgba(15, 23, 42, 0.78)'],
    [/background-color:\s*#fff\b/gi, 'background-color: rgba(15, 23, 42, 0.72)'],
    [/background-color:\s*#ffffff/gi, 'background-color: rgba(15, 23, 42, 0.65)'],
    [/color:\s*white/gi, 'color: #f8fafc'],
    [/color:\s*#0c5460/gi, 'color: #a5f3fc'],
    [/color:\s*#155724/gi, 'color: #a7f3d0'],
    [/color:\s*#856404/gi, 'color: #fde68a'],
    [/color:\s*#721c24/gi, 'color: #fecdd3'],
    [/color:\s*#666(?:666)?/gi, 'color: #94a3b8'],
    [/color:\s*#2c3e50/gi, 'color: #e2e8f0'],
    [/color:\s*#333333?/gi, 'color: #e2e8f0'],
    [/border-left:\s*4px\s+solid\s+#ffc107/gi, 'border-left: 4px solid rgba(245, 158, 11, 0.8)'],
    [/border:\s*2px\s+solid\s+#dc3545/gi, 'border: 2px solid rgba(244, 63, 94, 0.72)'],
    [/border:\s*2px\s+solid\s+#28a745/gi, 'border: 2px solid rgba(16, 185, 129, 0.72)'],
    [/border:\s*1px\s+solid\s+#ddd/gi, 'border: 1px solid rgba(51, 65, 85, 0.85)'],
    [/border:\s*1px\s+solid\s+#e9ecef/gi, 'border: 1px solid rgba(51, 65, 85, 0.85)'],
    [/border:\s*1px\s+solid\s+#dee2e6/gi, 'border: 1px solid rgba(51, 65, 85, 0.85)'],
    [/border-top:\s*1px\s+solid\s+#ddd/gi, 'border-top: 1px solid rgba(51, 65, 85, 0.85)'],
    [/background-color:\s*#007bff/gi, 'background-color: #0284c7'],
    [/background-color:\s*#28a745/gi, 'background-color: #059669'],
    [/background-color:\s*#dc3545/gi, 'background-color: #be123c'],
    [/color:\s*#007bff/gi, 'color: #38bdf8'],
  ];

  return styleReplacements.reduce(
    (normalizedHtml, [pattern, replacement]) => normalizedHtml.replace(pattern, replacement),
    html
  );
};

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
        const regex = new RegExp(`{{${escapeRegExp(variable)}}}`, 'g');
        const value = exampleData[variable] || `[${variable}]`;
        previewHtml = previewHtml.replace(regex, value);
      });

      previewHtml = normalizeLegacyPreviewStyles(previewHtml);

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
