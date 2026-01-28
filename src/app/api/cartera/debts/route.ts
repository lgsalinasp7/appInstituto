
import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const result = await PaymentService.getDebts({
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener lista de deudas" },
      { status: 500 }
    );
  }
}
