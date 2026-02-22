import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { EmailTemplateService } from '@/modules/email-sequences';
import { updateTemplateSchema } from '@/modules/email-sequences/schemas';
import { z } from 'zod';

// GET /api/email-sequences/templates/[id] - Obtener plantilla
export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
    try {
        const params = context?.params ? await context.params : {};
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID requerido' },
                { status: 400 }
            );
        }
        const template = await EmailTemplateService.getById(id, tenantId);

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: template,
        });
    } catch (error: any) {
        console.error('[API] Error getting template:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});

// PUT /api/email-sequences/templates/[id] - Actualizar plantilla
export const PUT = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
    try {
        const params = context?.params ? await context.params : {};
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID requerido' },
                { status: 400 }
            );
        }
        const body = await request.json();
        const validated = updateTemplateSchema.parse(body);

        const template = await EmailTemplateService.update(id, validated, tenantId);

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

        console.error('[API] Error updating template:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});

// DELETE /api/email-sequences/templates/[id] - Eliminar plantilla
export const DELETE = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
    try {
        const params = context?.params ? await context.params : {};
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID requerido' },
                { status: 400 }
            );
        }
        await EmailTemplateService.delete(id, tenantId);

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully',
        });
    } catch (error: any) {
        console.error('[API] Error deleting template:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});
