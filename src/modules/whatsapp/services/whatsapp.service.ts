import crypto from 'crypto';

export interface WhatsAppMessagePayload {
  to: string;
  message: string;
}

export class WhatsAppService {
  private static API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v22.0';
  private static PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private static ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  private static APP_SECRET = process.env.WHATSAPP_APP_SECRET;

  static async sendMessage(payload: WhatsAppMessagePayload): Promise<boolean> {
    const { to, message } = payload;

    if (!this.PHONE_NUMBER_ID || !this.ACCESS_TOKEN) {
      console.error(
        'WhatsApp API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN'
      );
      return false;
    }

    try {
      const cleanPhone = to.replace(/\D/g, '');
      const phoneWithCountry = cleanPhone.startsWith('57')
        ? cleanPhone
        : `57${cleanPhone}`;

      const response = await fetch(`${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneWithCountry,
          type: 'text',
          text: { body: message },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API Error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  static async processWebhook(_body: unknown, _tenantId: string): Promise<void> {
    throw new Error(
      'El procesamiento de leads de tenant vía WhatsApp webhook fue removido por política de separación.'
    );
  }

  static verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.APP_SECRET) {
      console.warn('WHATSAPP_APP_SECRET not configured, skipping signature verification');
      return true;
    }

    try {
      const hash = crypto.createHmac('sha256', this.APP_SECRET).update(body).digest('hex');
      const expectedSignature = `sha256=${hash}`;

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}
