import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const advisorId = searchParams.get("advisorId") || undefined;

    const alerts = await CarteraService.getAlerts(advisorId);

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener alertas" },
      { status: 500 }
    );
  }
}
