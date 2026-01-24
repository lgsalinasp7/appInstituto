import { NextRequest, NextResponse } from "next/server";
import { ReceiptService } from "@/modules/receipts";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get("phone") || undefined;

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

    const whatsappUrl = ReceiptService.generateWhatsAppUrl(receipt, phoneNumber);

    return NextResponse.json({
      success: true,
      data: {
        whatsappUrl,
        receiptNumber: receipt.receiptNumber,
        studentPhone: receipt.student.phone,
      },
    });
  } catch (error) {
    console.error("Error generating WhatsApp URL:", error);
    return NextResponse.json(
      { success: false, error: "Error al generar URL de WhatsApp" },
      { status: 500 }
    );
  }
}
