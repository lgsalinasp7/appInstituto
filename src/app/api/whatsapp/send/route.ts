import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuthAndCSRF } from '@/lib/api-auth';
import { WhatsAppService } from '@/modules/whatsapp/services/whatsapp.service';
import { z } from 'zod';

const sendMessageSchema = z.object({
    prospectId: z.string().cuid().optional(),
    to: z.string().min(7, 'Teléfono requerido'),
    message: z.string().min(1, 'Mensaje requerido'),
    templateName: z.string().optional(),
});

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
    try {
        const body = await request.json();
        const validated = sendMessageSchema.parse(body);

        const whatsappMessage = await WhatsAppService.sendAndLog({
            to: validated.to,
            message: validated.message,
            prospectId: validated.prospectId,
            templateName: validated.templateName,
            tenantId,
        });

        return NextResponse.json({
            success: true,
            data: whatsappMessage,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error sending WhatsApp message:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Error al enviar mensaje' },
            { status: 500 }
        );
    }
});
