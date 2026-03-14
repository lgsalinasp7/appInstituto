/**
 * Utilidades de WhatsApp para Lavadero Pro
 */

export function generateReadyMessage(
  customerName: string,
  plate: string,
  services: string[],
  total: number
): string {
  const totalFormatted = total.toLocaleString("es-CO");
  return (
    `Hola ${customerName}, su vehículo ${plate} ya está listo.\n\n` +
    `Servicios: ${services.join(", ")}\n` +
    `Total: $${totalFormatted} COP\n\n` +
    `¡Lo esperamos!`
  );
}

export function generateInvoiceMessage(
  customerName: string,
  plate: string,
  services: { name: string; price: number }[],
  total: number,
  paymentMethod: string
): string {
  const totalFormatted = total.toLocaleString("es-CO");
  const serviceLines = services
    .map((s) => `  - ${s.name}: $${s.price.toLocaleString("es-CO")}`)
    .join("\n");
  return (
    `Factura - Lavadero Pro\n\n` +
    `Cliente: ${customerName}\n` +
    `Vehículo: ${plate}\n\n` +
    `Servicios:\n${serviceLines}\n\n` +
    `Total: $${totalFormatted} COP\n` +
    `Método: ${paymentMethod}\n\n` +
    `¡Gracias por su preferencia!`
  );
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneWithCountry = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}
