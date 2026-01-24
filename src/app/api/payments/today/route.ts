import { NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";

export async function GET() {
  try {
    const result = await PaymentService.getTodayPayments();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching today payments:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pagos del día" },
      { status: 500 }
    );
  }
}
