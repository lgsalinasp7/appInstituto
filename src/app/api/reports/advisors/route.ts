import { NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";

export async function GET() {
  try {
    const reports = await ReportsService.getAdvisorReports();

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching advisor reports:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener reportes de asesores" },
      { status: 500 }
    );
  }
}
