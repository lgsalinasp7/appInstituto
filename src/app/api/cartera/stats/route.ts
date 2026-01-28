
import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";

export async function GET(request: NextRequest) {
    try {
        const stats = await PaymentService.getCarteraStats();
        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("Error fetching cartera stats:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener estadísticas de cartera" },
            { status: 500 }
        );
    }
}
