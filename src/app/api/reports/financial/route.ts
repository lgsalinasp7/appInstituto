import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      advisorId: searchParams.get("advisorId") || undefined,
      programId: searchParams.get("programId") || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    };

    const report = await ReportsService.getFinancialReport(filters);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching financial report:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener reporte financiero" },
      { status: 500 }
    );
  }
}
