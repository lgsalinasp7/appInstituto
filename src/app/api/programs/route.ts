import { NextRequest, NextResponse } from "next/server";
import { ProgramService } from "@/modules/programs";
import { z } from "zod";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

const createProgramSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().nullable().optional(),
  totalValue: z.coerce.number().min(0, "El valor total no puede ser negativo"),
  matriculaValue: z.coerce.number().min(0, "El valor de matrícula no puede ser negativo"),
  modulesCount: z.coerce.number().int().min(1, "La cantidad de módulos debe ser al menos 1"),
  isActive: z.boolean().optional(),
});

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const includeInactive = searchParams.get("includeInactive") === "true";

  const result = await ProgramService.getPrograms(includeInactive, tenantId);

  return NextResponse.json({
    success: true,
    data: result,
  });
});

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
  const body = await request.json();

  const validationResult = createProgramSchema.safeParse(body);

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

  const program = await ProgramService.createProgram(validationResult.data, tenantId);

  return NextResponse.json({
    success: true,
    data: program,
    message: "Programa creado exitosamente",
  }, { status: 201 });
});
