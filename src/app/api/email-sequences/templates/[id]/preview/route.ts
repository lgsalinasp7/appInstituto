import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { EmailTemplateService } from '@/modules/email-sequences';

// POST /api/email-sequences/templates/[id]/preview - Preview con datos de ejemplo
export const POST = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
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
        const sampleData = body.sampleData || {};

        const html = await EmailTemplateService.preview(id, sampleData, tenantId);

        return NextResponse.json({
            success: true,
            data: { html },
        });
    } catch (error: any) {
        console.error('[API] Error previewing template:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});
