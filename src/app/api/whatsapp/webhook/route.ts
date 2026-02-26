import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/modules/whatsapp/services/whatsapp.service';

/**
 * GET - Verificación del webhook de Meta
 * Meta envía: hub.mode, hub.verify_token, hub.challenge
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '1234567890';

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST - Mensajes entrantes y actualizaciones de estado
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-hub-signature-256') || '';

        // Verificar firma (opcional en desarrollo)
        if (process.env.NODE_ENV === 'production') {
            const isValid = WhatsAppService.verifyWebhookSignature(body, signature);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
            }
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    'Webhook recibido, pero el procesamiento de leads tenant está deshabilitado por política de separación.',
                code: 'TENANT_LEADS_DISABLED',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing WhatsApp webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
