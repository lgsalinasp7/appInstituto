import { NextRequest, NextResponse } from "next/server";
import { ReceiptService } from "@/modules/receipts";
import { withTenantAuthAndCSRF } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const body = await request.json();
  const { via, phoneNumber } = body;

  if (!via || !["whatsapp", "email"].includes(via)) {
    return NextResponse.json(
      { success: false, error: "Método de envío inválido" },
      { status: 400 }
    );
  }

  let receipt = await ReceiptService.getReceiptByNumber(id);
  
  if (!receipt) {
    receipt = await ReceiptService.getReceiptByPaymentId(id);
  }

  if (!receipt) {
    return NextResponse.json(
      { success: false, error: "Recibo no encontrado" },
      { status: 404 }
    );
  }

  if (via === "whatsapp") {
    const whatsappUrl = ReceiptService.generateWhatsAppUrl(receipt, phoneNumber);
    
    await ReceiptService.markAsSent(receipt.id, "whatsapp");

    return NextResponse.json({
      success: true,
      data: {
        whatsappUrl,
        message: "URL de WhatsApp generada exitosamente",
      },
    });
  }

  return NextResponse.json({
    success: false,
    error: "Método de envío no implementado",
  }, { status: 501 });
});
