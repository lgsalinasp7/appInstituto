import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";
import { z } from "zod";
import { withTenantAuthAndCSRF } from "@/lib/api-auth";

const updatePaymentSchema = z.object({
  amount: z.number().optional(),
  paymentDate: z.string().transform(str => new Date(str)).optional(),
  method: z.enum(["BANCOLOMBIA", "NEQUI", "DAVIPLATA", "EFECTIVO", "OTRO"]).optional(),
  reference: z.string().optional(),
  comments: z.string().optional(),
  city: z.string().trim().min(2).optional(),
  supportDocumentUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
});

export const PUT = withTenantAuthAndCSRF(async (
  request: NextRequest,
  user,
  tenantId,
  context?: { params: Promise<Record<string, string>> }
) => {
  const { id } = await context!.params;
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

  const updatedPayment = await PaymentService.updatePayment(id, validationResult.data, tenantId);

  return NextResponse.json({
    success: true,
    data: updatedPayment,
    message: "Pago actualizado exitosamente",
  });
});
