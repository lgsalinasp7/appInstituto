import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const advisorId = searchParams.get("advisorId") || undefined;

    const summary = await CarteraService.getSummary(advisorId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching cartera summary:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener resumen de cartera" },
      { status: 500 }
    );
  }
}
