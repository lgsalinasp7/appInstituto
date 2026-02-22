import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { EmailTemplateService } from '@/modules/email-sequences';
import { createTemplateSchema } from '@/modules/email-sequences/schemas';
import { z } from 'zod';

// GET /api/email-sequences/templates - Listar plantillas
export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
    try {
        const templates = await EmailTemplateService.getAll(tenantId);

        return NextResponse.json({
            success: true,
            data: templates,
        });
    } catch (error: any) {
        console.error('[API] Error getting templates:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});

// POST /api/email-sequences/templates - Crear plantilla
export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
    try {
        const body = await request.json();
        const validated = createTemplateSchema.parse(body);

        const template = await EmailTemplateService.create(validated, tenantId);

        return NextResponse.json({
            success: true,
            data: template,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos', details: error.issues },
                { status: 400 }
            );
        }

        console.error('[API] Error creating template:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});
