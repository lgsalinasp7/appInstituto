import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/modules/students";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const summary = await StudentService.getStudentPaymentsSummary(id);

    if (!summary) {
      return NextResponse.json(
        { success: false, error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pagos del estudiante" },
      { status: 500 }
    );
  }
}
