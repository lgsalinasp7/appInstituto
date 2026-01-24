import { NextRequest, NextResponse } from "next/server";
import { ProgramService } from "@/modules/programs";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

const updateProgramSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  totalValue: z.coerce.number().min(0).optional(),
  matriculaValue: z.coerce.number().min(0).optional(),
  modulesCount: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const program = await ProgramService.getProgramById(id);

    if (!program) {
      return NextResponse.json(
        { success: false, error: "Programa no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener programa" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = updateProgramSchema.safeParse(body);

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

    const program = await ProgramService.updateProgram(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: program,
      message: "Programa actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating program:", error);

    if (error instanceof Error && error.message.includes("nombre")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al actualizar programa" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await ProgramService.deleteProgram(id);

    return NextResponse.json({
      success: true,
      message: "Programa eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting program:", error);

    if (error instanceof Error && error.message.includes("estudiantes")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al eliminar programa" },
      { status: 500 }
    );
  }
}
