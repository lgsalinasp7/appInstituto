import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const advisorId = searchParams.get("advisorId") || undefined;

    const debts = await CarteraService.getStudentsWithDebt(advisorId);

    return NextResponse.json({
      success: true,
      data: debts,
    });
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener deudas" },
      { status: 500 }
    );
  }
}
