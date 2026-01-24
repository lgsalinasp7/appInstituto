import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const payment = await PaymentService.getPaymentById(id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pago" },
      { status: 500 }
    );
  }
}
