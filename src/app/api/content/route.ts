import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";
import { z } from "zod";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

const createContentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  orderIndex: z.coerce.number().int().min(1, "El orden debe ser mayor a 0"),
  programId: z.string().min(1, "Debe seleccionar un programa"),
});

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
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
});

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
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
});
