import { NextRequest, NextResponse } from "next/server";
import { ProspectService } from "@/modules/prospects";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const advisorId = searchParams.get("advisorId") || undefined;

    const stats = await ProspectService.getStats(advisorId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching prospect stats:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas de prospectos" },
      { status: 500 }
    );
  }
}
