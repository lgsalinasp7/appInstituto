interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  studentDocument?: string;
  amount: number;
  paymentDate: string;
  method: string;
  reference?: string | null;
  institutionName?: string;
  newBalance?: number;
  programName?: string;
}

export function generateReceiptMessage(data: ReceiptData): string {
  const institutionName = data.institutionName || "Plataforma";
  const formattedDate = new Date(data.paymentDate).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let message = `

👋 *${institutionName}*

*¡Educamos con Valores:* Tu camino hacia el éxito educativo!

━━━━━━━━━━━━━━━━━━━━
       📄 *RECIBO DE PAGO*
━━━━━━━━━━━━━━━━━━━━

📋 *No. Recibo:* ${data.receiptNumber}
📅 *Fecha:* ${formattedDate}

👤 *Estudiante:* ${data.studentName}`;

  if (data.studentDocument) {
    message += `\n🆔 *No. Identificación:* ${data.studentDocument}`;
  }

  if (data.programName) {
    message += `\n📚 *Programa:* ${data.programName}`;
  }

  message += `

💰 *Monto Pagado:* $${data.amount.toLocaleString("es-CO")}
🏦 *Método:* ${data.method}`;

  if (data.reference) {
    message += `\n🔖 *Referencia:* ${data.reference}`;
  }

  if (data.newBalance !== undefined) {
    message += `\n\n💳 *Saldo Pendiente:* $${data.newBalance.toLocaleString("es-CO")}`;
  }

  message += `

━━━━━━━━━━━━━━━━━━━━
✅ Gracias por su pago.
Este es un comprobante digital válido.
━━━━━━━━━━━━━━━━━━━━

_*${institutionName}*_
_¡Educamos con Valores!_ 🙌`;

  return message;
}

export function generateWhatsAppUrl(phone: string, message: string, useWebWhatsApp: boolean = false): string {
  const cleanPhone = phone.replace(/\D/g, "");

  const phoneWithCountry = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;

  const encodedMessage = encodeURIComponent(message.trim());

  if (useWebWhatsApp) {
    return `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedMessage}`;
  }

  return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedMessage}`;
}

export async function sendReceiptViaWhatsAppAPI(
  phone: string,
  receiptData: ReceiptData,
  imageUrl?: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/whatsapp/send-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        message: generateReceiptMessage(receiptData),
        imageUrl: imageUrl || "/assets/logo-instituto.png",
      }),
    });

    if (!response.ok) {
      throw new Error("Error al enviar por WhatsApp API");
    }

    return true;
  } catch (error) {
    console.error("Error usando WhatsApp API:", error);
    return false;
  }
}

export function sendReceiptViaWhatsApp(
  phone: string,
  receiptData: ReceiptData,
  useWebWhatsApp: boolean = false,
  useAPI: boolean = false,
  imageUrl?: string
): void {
  if (useAPI) {
    sendReceiptViaWhatsAppAPI(phone, receiptData, imageUrl).then((success) => {
      if (!success) {
        const message = generateReceiptMessage(receiptData);
        const url = generateWhatsAppUrl(phone, message, useWebWhatsApp);
        window.open(url, "_blank");
      }
    });
    return;
  }

  const message = generateReceiptMessage(receiptData);
  const url = generateWhatsAppUrl(phone, message, useWebWhatsApp);
  window.open(url, "_blank");
}

interface ReminderData {
  studentName: string;
  amount: number;
  dueDate: string;
  daysOverdue?: number;
  institutionName?: string;
}

export function generatePaymentReminderMessage(data: ReminderData): string {
  const institutionName = data.institutionName || "Plataforma";
  const formattedDate = new Date(data.dueDate).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let message = `
Hola ${data.studentName.split(" ")[0]},

Te escribimos del *${institutionName}* para recordarte tu compromiso de pago.

*Monto:* $${data.amount.toLocaleString("es-CO")}`;

  if (data.daysOverdue && data.daysOverdue > 0) {
    message += `\n*Estado:* Vencido hace ${data.daysOverdue} días`;
  } else {
    message += `\n*Fecha límite:* ${formattedDate}`;
  }

  message += `

Por favor, realiza tu pago a tiempo para mantener tu estado al día.

Si ya realizaste el pago, por favor ignora este mensaje.

Gracias.`;

  return message;
}

export function sendPaymentReminderViaWhatsApp(
  phone: string,
  reminderData: ReminderData,
  useWebWhatsApp: boolean = false
): void {
  const message = generatePaymentReminderMessage(reminderData);
  const url = generateWhatsAppUrl(phone, message, useWebWhatsApp);
  window.open(url, "_blank");
}
