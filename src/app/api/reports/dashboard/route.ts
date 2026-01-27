import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const advisorId = searchParams.get("advisorId") || undefined;
    const programId = searchParams.get("programId") || undefined;

    const [stats, revenueChart] = await Promise.all([
      ReportsService.getDashboardStats(advisorId, programId),
      ReportsService.getRevenueChartData("month", advisorId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        revenueChart
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas del dashboard" },
      { status: 500 }
    );
  }
}
