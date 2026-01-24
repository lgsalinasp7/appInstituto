import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

const updateContentSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  orderIndex: z.coerce.number().int().min(1).optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = updateContentSchema.safeParse(body);

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

    const content = await ContentService.updateContent(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: content,
      message: "Contenido actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar contenido" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await ContentService.deleteContent(id);

    return NextResponse.json({
      success: true,
      message: "Contenido eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar contenido" },
      { status: 500 }
    );
  }
}
