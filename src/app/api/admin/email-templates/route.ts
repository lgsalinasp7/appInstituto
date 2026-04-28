/**
 * Email Templates API Routes
 * GET /api/admin/email-templates - List all templates
 * POST /api/admin/email-templates - Create new template
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledEmailService } from '@/modules/kaled-crm/services/kaled-email.service';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';
import { z } from 'zod';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  htmlContent: z.string().min(1, 'El contenido HTML es requerido'),
  variables: z.array(z.string()).optional(),
  category: z.string().optional(),
  campaignId: z.string().optional(),
});

// GET /api/admin/email-templates
export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user) => {
    const ctx = logApiStart(request, "admin_email_templates_list", undefined, { userId: user.id });
    const startedAt = Date.now();
    try {
      const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));
      const templates = await KaledEmailService.getAllTemplates(tenantId);

      logApiSuccess(ctx, "admin_email_templates_list", { duration: Date.now() - startedAt });
      return NextResponse.json({
        success: true,
        data: templates,
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_email_templates_list", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al obtener las plantillas',
        },
        { status: 500 }
      );
    }
  }
);

// POST /api/admin/email-templates
export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest, user) => {
    const ctx = logApiStart(request, "admin_email_templates_create", undefined, { userId: user.id });
    const startedAt = Date.now();
    try {
      const body = await request.json();

      // Validar datos
      const validation = createTemplateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));
      const template = await KaledEmailService.createTemplate(tenantId, validation.data);

      logApiSuccess(ctx, "admin_email_templates_create", { duration: Date.now() - startedAt, resultId: template.id });
      return NextResponse.json({
        success: true,
        data: template,
        message: 'Plantilla creada correctamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, "admin_email_templates_create", { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error al crear la plantilla',
        },
        { status: 500 }
      );
    }
  }
);
