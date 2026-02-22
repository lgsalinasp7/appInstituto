import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { EmailSequenceService } from '@/modules/email-sequences';
import { updateSequenceSchema } from '@/modules/email-sequences/schemas';
import { z } from 'zod';

// GET /api/email-sequences/[id] - Obtener secuencia
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
        const sequence = await EmailSequenceService.getById(id, tenantId);

        if (!sequence) {
            return NextResponse.json(
                { success: false, error: 'Sequence not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: sequence,
        });
    } catch (error: any) {
        console.error('[API] Error getting sequence:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});

// PUT /api/email-sequences/[id] - Actualizar secuencia
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
        const validated = updateSequenceSchema.parse(body);

        const sequence = await EmailSequenceService.update(id, validated, tenantId);

        return NextResponse.json({
            success: true,
            data: sequence,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos', details: error.issues },
                { status: 400 }
            );
        }

        console.error('[API] Error updating sequence:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});

// DELETE /api/email-sequences/[id] - Eliminar secuencia
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
        await EmailSequenceService.delete(id, tenantId);

        return NextResponse.json({
            success: true,
            message: 'Sequence deleted successfully',
        });
    } catch (error: any) {
        console.error('[API] Error deleting sequence:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});
