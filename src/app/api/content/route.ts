import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";
import { z } from "zod";

const createContentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  orderIndex: z.coerce.number().int().min(1, "El orden debe ser mayor a 0"),
  programId: z.string().min(1, "Debe seleccionar un programa"),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const programId = searchParams.get("programId");

    if (!programId) {
      return NextResponse.json(
        { success: false, error: "Se requiere el ID del programa" },
        { status: 400 }
      );
    }

    const contents = await ContentService.getContentsByProgram(programId);

    return NextResponse.json({
      success: true,
      data: contents,
    });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener contenidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = createContentSchema.safeParse(body);

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

    const content = await ContentService.createContent(validationResult.data);

    return NextResponse.json({
      success: true,
      data: content,
      message: "Contenido creado exitosamente",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear contenido" },
      { status: 500 }
    );
  }
}
