import { NextRequest, NextResponse } from "next/server";
import { ExportService } from "@/modules/reports/services/export.service";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const filters = {
            startDate: searchParams.get("startDate")
                ? new Date(searchParams.get("startDate")!)
                : undefined,
            endDate: searchParams.get("endDate")
                ? new Date(searchParams.get("endDate")!)
                : undefined,
            method: searchParams.get("method") || undefined,
        };

        const buffer = await ExportService.exportPaymentsToExcel(filters);

        return new NextResponse(buffer as any, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="Reporte_Pagos_${new Date().toISOString().split("T")[0]}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json(
            { success: false, error: "Error al generar el reporte" },
            { status: 500 }
        );
    }
}
