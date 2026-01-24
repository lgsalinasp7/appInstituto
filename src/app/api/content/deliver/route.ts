import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";
import { z } from "zod";

const deliverSchema = z.object({
  studentId: z.string().min(1, "Debe seleccionar un estudiante"),
  contentId: z.string().min(1, "Debe seleccionar un contenido"),
  method: z.enum(["email", "whatsapp", "manual", "presencial"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = deliverSchema.safeParse(body);

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

    const delivery = await ContentService.deliverContent(validationResult.data);

    return NextResponse.json({
      success: true,
      data: delivery,
      message: "Contenido entregado exitosamente",
    });
  } catch (error) {
    console.error("Error delivering content:", error);

    if (error instanceof Error && error.message.includes("ya fue entregado")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al entregar contenido" },
      { status: 500 }
    );
  }
}
