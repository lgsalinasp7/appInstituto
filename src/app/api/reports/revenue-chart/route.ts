import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") as "week" | "month") || "month";
    const advisorId = searchParams.get("advisorId") || undefined;

    const chartData = await ReportsService.getRevenueChartData(period, advisorId);

    return NextResponse.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error fetching revenue chart data:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener datos del gráfico" },
      { status: 500 }
    );
  }
}
