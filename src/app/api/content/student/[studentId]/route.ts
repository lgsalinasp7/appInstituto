import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";

interface Params {
  params: Promise<{ studentId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { studentId } = await params;

    const status = await ContentService.getStudentContentStatus(studentId);

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error fetching student content status:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estado de contenido" },
      { status: 500 }
    );
  }
}
