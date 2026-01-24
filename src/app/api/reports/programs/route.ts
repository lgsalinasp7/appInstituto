import { NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";

export async function GET() {
  try {
    const reports = await ReportsService.getProgramReports();

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching program reports:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener reportes de programas" },
      { status: 500 }
    );
  }
}
