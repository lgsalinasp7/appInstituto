import { NextRequest, NextResponse } from "next/server";
import { ReceiptService } from "@/modules/receipts";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
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

    return NextResponse.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener recibo" },
      { status: 500 }
    );
  }
}
