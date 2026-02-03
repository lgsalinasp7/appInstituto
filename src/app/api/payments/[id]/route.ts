import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";
import { z } from "zod";

const updatePaymentSchema = z.object({
  amount: z.number().optional(),
  paymentDate: z.string().transform(str => new Date(str)).optional(),
  method: z.enum(["BANCOLOMBIA", "NEQUI", "DAVIPLATA", "EFECTIVO", "OTRO"]).optional(),
  reference: z.string().optional(),
  comments: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validationResult = updatePaymentSchema.safeParse(body);

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

    const updatedPayment = await PaymentService.updatePayment(params.id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: "Pago actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar pago" },
      { status: 500 }
    );
  }
}
