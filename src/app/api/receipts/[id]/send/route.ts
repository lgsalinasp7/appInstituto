import { NextRequest, NextResponse } from "next/server";
import { ReceiptService } from "@/modules/receipts";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
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
  } catch (error) {
    console.error("Error sending receipt:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar recibo" },
      { status: 500 }
    );
  }
}
