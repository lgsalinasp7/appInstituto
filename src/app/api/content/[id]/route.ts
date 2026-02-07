import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";
import { z } from "zod";
import { withTenantAuthAndCSRF } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

const updateContentSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  orderIndex: z.coerce.number().int().min(1).optional(),
});

export const PATCH = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const body = await request.json();

  const validationResult = updateContentSchema.safeParse(body);

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

  const content = await ContentService.updateContent(id, validationResult.data);

  return NextResponse.json({
    success: true,
    data: content,
    message: "Contenido actualizado exitosamente",
  });
});

export const DELETE = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  await ContentService.deleteContent(id);

  return NextResponse.json({
    success: true,
    message: "Contenido eliminado exitosamente",
  });
});
