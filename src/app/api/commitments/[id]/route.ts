import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

const updateCommitmentSchema = z.object({
  scheduledDate: z.coerce.date().optional(),
  amount: z.coerce.number().positive().optional(),
  status: z.enum(["PAGADO", "PENDIENTE", "EN_COMPROMISO"]).optional(),
  rescheduledDate: z.coerce.date().optional(),
  comments: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = updateCommitmentSchema.safeParse(body);

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

    const commitment = await CarteraService.updateCommitment(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: commitment,
      message: "Compromiso actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating commitment:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar compromiso" },
      { status: 500 }
    );
  }
}
