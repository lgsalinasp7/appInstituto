import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const advisorId = searchParams.get("advisorId") || undefined;

    const pendingDeliveries = await ContentService.getPendingDeliveries(advisorId);

    return NextResponse.json({
      success: true,
      data: pendingDeliveries,
    });
  } catch (error) {
    console.error("Error fetching pending deliveries:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener entregas pendientes" },
      { status: 500 }
    );
  }
}
