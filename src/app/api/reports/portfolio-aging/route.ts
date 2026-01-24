import { NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";

export async function GET() {
    try {
        const aging = await ReportsService.getPortfolioAging();

        return NextResponse.json({
            success: true,
            data: aging,
        });
    } catch (error) {
        console.error("Error fetching portfolio aging:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener el reporte de cartera" },
            { status: 500 }
        );
    }
}
