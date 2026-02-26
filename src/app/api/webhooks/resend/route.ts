/**
 * Webhook de Resend para tracking de emails
 *
 * Eventos soportados:
 * - email.sent
 * - email.delivered
 * - email.opened
 * - email.clicked
 * - email.bounced
 *
 * Configuración en Resend:
 * URL: https://tusaas.com/api/webhooks/resend
 * Events: Seleccionar todos los eventos de email
 * Secret: Guardar en RESEND_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleEmailOpened,
  handleEmailClicked,
  handleEmailDelivered,
  handleEmailBounced,
} from '@/modules/kaled-crm/services/kaled-automation.service';

// Verificar firma de Resend (opcional pero recomendado)
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get('resend-signature');
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('⚠️ RESEND_WEBHOOK_SECRET not configured - skipping verification');
    return true; // Permitir en desarrollo sin secret
  }

  if (!signature) {
    console.error('❌ Missing resend-signature header');
    return false;
  }

  // Implementar verificación de firma aquí si Resend lo proporciona
  // Por ahora, solo verificamos que el secret esté configurado
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Verificar firma
    if (!verifyWebhookSignature(request, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    console.log(`📬 Resend webhook received: ${event.type}`);

    // Extraer datos del evento
    const { type, data } = event;
    const { email_id, email } = data || {};

    // Buscar el email log por resendId
    const emailLog = await prisma.kaledEmailLog.findFirst({
      where: { resendId: email_id },
      include: {
        kaledLead: true,
      },
    });

    if (!emailLog) {
      console.warn(`⚠️ Email log not found for resendId: ${email_id}`);
      return NextResponse.json({ received: true });
    }

    // Procesar según el tipo de evento
    switch (type) {
      case 'email.sent':
        console.log(`📤 Email sent: ${email_id}`);
        // El email ya está marcado como SENT al crearse
        break;

      case 'email.delivered':
        await handleEmailDelivered(emailLog.id);
        break;

      case 'email.opened':
        if (emailLog.kaledLeadId) {
          await handleEmailOpened(emailLog.id, emailLog.kaledLeadId);
        }
        break;

      case 'email.clicked':
        if (emailLog.kaledLeadId) {
          await handleEmailClicked(emailLog.id, emailLog.kaledLeadId);
        }
        break;

      case 'email.bounced':
        await handleEmailBounced(emailLog.id);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing Resend webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Permitir GET para verificación del endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Resend Webhook Handler',
    timestamp: new Date().toISOString(),
  });
}
