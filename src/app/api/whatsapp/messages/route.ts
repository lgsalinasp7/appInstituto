import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { WhatsAppService } from '@/modules/whatsapp/services/whatsapp.service';

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
    try {
        const searchParams = request.nextUrl.searchParams;
        const phone = searchParams.get('phone');
        const prospectId = searchParams.get('prospectId');

        if (!phone && !prospectId) {
            return NextResponse.json(
                { success: false, error: 'Se requiere phone o prospectId' },
                { status: 400 }
            );
        }

        let phoneNumber = phone;

        // Si se proporciona prospectId, obtener el teléfono
        if (prospectId) {
            const { prisma } = await import('@/lib/prisma');
            const prospect = await prisma.prospect.findUnique({
                where: { id: prospectId },
            });

            if (!prospect) {
                return NextResponse.json(
                    { success: false, error: 'Prospect no encontrado' },
                    { status: 404 }
                );
            }

            phoneNumber = prospect.phone;
        }

        if (!phoneNumber) {
            return NextResponse.json(
                { success: false, error: 'Teléfono no encontrado' },
                { status: 400 }
            );
        }

        const messages = await WhatsAppService.getConversationHistory(
            phoneNumber,
            tenantId
        );

        return NextResponse.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Error fetching WhatsApp messages:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener mensajes' },
            { status: 500 }
        );
    }
});
