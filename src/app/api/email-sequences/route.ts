import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';
import { EmailSequenceService } from '@/modules/email-sequences';
import { createSequenceSchema } from '@/modules/email-sequences/schemas';
import { z } from 'zod';

// GET /api/email-sequences - Listar secuencias
export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
    try {
        const sequences = await EmailSequenceService.getAll(tenantId);

        return NextResponse.json({
            success: true,
            data: sequences,
        });
    } catch (error: any) {
        console.error('[API] Error getting sequences:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});

// POST /api/email-sequences - Crear secuencia
export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
    try {
        const body = await request.json();
        const validated = createSequenceSchema.parse(body);

        const sequence = await EmailSequenceService.create(validated, tenantId);

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

        console.error('[API] Error creating sequence:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});
