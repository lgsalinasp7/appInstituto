import { NextResponse } from "next/server";
import { StudentService } from "@/modules/students/services/student.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de estudiante requerido" },
        { status: 400 }
      );
    }

    const receiptData = await StudentService.getMatriculaReceipt(id);

    return NextResponse.json({ success: true, data: receiptData });
  } catch (error) {
    console.error("Error fetching matricula receipt:", error);

    const errorMessage = error instanceof Error ? error.message : "Error al obtener el recibo de matrícula";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes("no encontr") ? 404 : 500 }
    );
  }
}
