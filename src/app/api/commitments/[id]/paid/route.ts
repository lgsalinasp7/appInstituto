import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const commitment = await CarteraService.markAsPaid(id);

    return NextResponse.json({
      success: true,
      data: commitment,
      message: "Compromiso marcado como pagado",
    });
  } catch (error) {
    console.error("Error marking commitment as paid:", error);
    return NextResponse.json(
      { success: false, error: "Error al marcar como pagado" },
      { status: 500 }
    );
  }
}
