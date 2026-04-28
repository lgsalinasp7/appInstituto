import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/modules/whatsapp/services/whatsapp.service';
import { logApiStart, logApiSuccess, logApiError, logApiOperation } from '@/lib/api-logger';

/**
 * GET - Verificación del webhook de Meta
 * Meta envía: hub.mode, hub.verify_token, hub.challenge
 */
export async function GET(request: NextRequest) {
    const ctx = logApiStart(request, "whatsapp_webhook_verify");
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '1234567890';

    if (mode === 'subscribe' && token === verifyToken) {
        logApiOperation(ctx, "whatsapp_webhook_verify", "Webhook verified successfully");
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST - Mensajes entrantes y actualizaciones de estado
 */
export async function POST(request: NextRequest) {
    const ctx = logApiStart(request, "whatsapp_webhook");
    const startedAt = Date.now();
    try {
        const body = await request.text();
        const signature = request.headers.get('x-hub-signature-256') || '';

        // Verificar firma (opcional en desarrollo)
        if (process.env.NODE_ENV === 'production') {
            const isValid = WhatsAppService.verifyWebhookSignature(body, signature);
            if (!isValid) {
                logApiError(ctx, "whatsapp_webhook", {
                    error: new Error("Invalid webhook signature"),
                });
                return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
            }
        }

        logApiSuccess(ctx, "whatsapp_webhook", { duration: Date.now() - startedAt });
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
        logApiError(ctx, "whatsapp_webhook", { error });
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
