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

        const data = JSON.parse(body);

        // Obtener tenant basado en el phoneNumberId del webhook
        // Esto permite soportar múltiples tenants con sus propios números de WhatsApp Business
        const tenantId = await getTenantIdFromWebhook(data);

        // Procesar webhook
        await WhatsAppService.processWebhook(data, tenantId);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error processing WhatsApp webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Helper: Obtener tenant ID basado en el phoneNumberId del webhook
 * Esto permite multi-tenant real basado en el número de WhatsApp Business
 */
async function getTenantIdFromWebhook(webhookData: any): Promise<string> {
    try {
        // Extraer phone_number_id del webhook payload
        const phoneNumberId = webhookData.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

        if (phoneNumberId) {
            // Mapeo de WhatsApp Business Phone ID -> Tenant ID
            // Este mapeo debe actualizarse cuando se agreguen nuevos tenants
            const PHONE_TO_TENANT: Record<string, string> = {
                // Ejemplo: 'PHONE_NUMBER_ID_EDUTEC': 'tenant-id-real-de-edutec',
                // Agregar más entradas cuando haya más tenants con WhatsApp
            };

            // Si hay un mapeo explícito, usarlo
            if (PHONE_TO_TENANT[phoneNumberId]) {
                console.log(`[WhatsApp] Tenant resuelto desde mapeo: ${PHONE_TO_TENANT[phoneNumberId]}`);
                return PHONE_TO_TENANT[phoneNumberId];
            }

            console.warn(`[WhatsApp] phoneNumberId ${phoneNumberId} no encontrado en mapeo, usando DEFAULT_TENANT_ID`);
        }

        // Fallback a variable de entorno
        const defaultTenantId = process.env.DEFAULT_TENANT_ID;
        if (defaultTenantId) {
            console.log(`[WhatsApp] Usando DEFAULT_TENANT_ID: ${defaultTenantId}`);
            return defaultTenantId;
        }

        // Si no hay ninguno configurado, lanzar error claro
        throw new Error(
            'No se pudo determinar el tenant para el webhook de WhatsApp. ' +
            'Configure DEFAULT_TENANT_ID en las variables de entorno o agregue el phoneNumberId al mapeo en webhook/route.ts'
        );
    } catch (error) {
        console.error('[WhatsApp] Error obteniendo tenantId:', error);
        throw error;
    }
}
