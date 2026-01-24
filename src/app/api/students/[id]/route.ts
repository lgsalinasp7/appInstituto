import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/modules/students";
import { updateStudentSchema } from "@/modules/students/schemas";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const student = await StudentService.getStudentById(id);

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estudiante" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = updateStudentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const student = await StudentService.updateStudent(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: student,
      message: "Estudiante actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar estudiante" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await StudentService.deleteStudent(id);

    return NextResponse.json({
      success: true,
      message: "Estudiante eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar estudiante" },
      { status: 500 }
    );
  }
}
