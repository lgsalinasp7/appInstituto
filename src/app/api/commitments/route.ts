import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";
import { z } from "zod";

const createCommitmentSchema = z.object({
  scheduledDate: z.coerce.date(),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  comments: z.string().optional(),
  studentId: z.string().min(1, "Debe seleccionar un estudiante"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = createCommitmentSchema.safeParse(body);

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

    const commitment = await CarteraService.createCommitment(validationResult.data);

    return NextResponse.json({
      success: true,
      data: commitment,
      message: "Compromiso de pago registrado exitosamente",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating commitment:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar compromiso" },
      { status: 500 }
    );
  }
}
