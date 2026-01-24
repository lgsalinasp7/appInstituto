import { NextRequest, NextResponse } from "next/server";
import { ProspectService } from "@/modules/prospects";
import { updateProspectSchema } from "@/modules/prospects/schemas";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const prospect = await ProspectService.getProspectById(id);

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: "Prospecto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prospect,
    });
  } catch (error) {
    console.error("Error fetching prospect:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener prospecto" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = updateProspectSchema.safeParse(body);

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

    const prospect = await ProspectService.updateProspect(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: prospect,
      message: "Prospecto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating prospect:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar prospecto" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await ProspectService.deleteProspect(id);

    return NextResponse.json({
      success: true,
      message: "Prospecto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar prospecto" },
      { status: 500 }
    );
  }
}
