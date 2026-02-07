import { NextRequest, NextResponse } from "next/server";
import { ProspectService } from "@/modules/prospects";
import { z } from "zod";
import { withTenantAuthAndCSRF } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

const convertSchema = z.object({
  documentType: z.string().default("CC"),
  documentNumber: z.string().min(5, "El documento debe tener al menos 5 caracteres"),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.email().optional().or(z.literal("")),
  enrollmentDate: z.coerce.date(),
  initialPayment: z.coerce.number().min(0),
  totalProgramValue: z.coerce.number().positive(),
});

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const body = await request.json();

  const validationResult = convertSchema.safeParse(body);

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

  const student = await ProspectService.convertToStudent(id, validationResult.data);

  return NextResponse.json({
    success: true,
    data: student,
    message: "Prospecto convertido a estudiante exitosamente",
  });
});
