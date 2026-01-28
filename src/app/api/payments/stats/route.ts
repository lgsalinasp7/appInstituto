
import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      advisorId: searchParams.get("advisorId") || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    };

    const stats = await PaymentService.getPaymentStats(filters);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas de pagos" },
      { status: 500 }
    );
  }
}
