export interface WhatsAppMessagePayload {
    to: string;
    message: string;
}

export class WhatsAppService {
    private static API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v24.0";
    private static PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    private static ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    static async sendMessage(payload: WhatsAppMessagePayload): Promise<boolean> {
        const { to, message } = payload;

        if (!this.PHONE_NUMBER_ID || !this.ACCESS_TOKEN) {
            console.error("WhatsApp API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN");
            return false;
        }

        try {
            const cleanPhone = to.replace(/\D/g, "");
            const phoneWithCountry = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;

            // Meta API actually expects just the number string for 'to', not @c.us (that's for other providers like Baileys)
            // The current implementation in src/app/api/whatsapp/send-receipt/route.ts used @c.us which might be wrong for Meta
            // but I should stick to what's likely working or what's expected by the official API.
            // Official Meta API uses just the number string.

            const response = await fetch(
                `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: phoneWithCountry,
                        type: "text",
                        text: { body: message },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("WhatsApp API Error:", errorData);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            return false;
        }
    }
}
