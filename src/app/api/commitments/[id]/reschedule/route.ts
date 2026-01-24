import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

const rescheduleSchema = z.object({
  newDate: z.coerce.date(),
  comments: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = rescheduleSchema.safeParse(body);

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

    const commitment = await CarteraService.reschedule(
      id,
      validationResult.data.newDate,
      validationResult.data.comments
    );

    return NextResponse.json({
      success: true,
      data: commitment,
      message: "Compromiso reprogramado exitosamente",
    });
  } catch (error) {
    console.error("Error rescheduling commitment:", error);
    return NextResponse.json(
      { success: false, error: "Error al reprogramar compromiso" },
      { status: 500 }
    );
  }
}
