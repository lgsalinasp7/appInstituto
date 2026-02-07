import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";
import { z } from "zod";
import { withTenantAuthAndCSRF } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

const rescheduleSchema = z.object({
  newDate: z.coerce.date(),
  comments: z.string().optional(),
});

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
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
});
