import { NextRequest, NextResponse } from "next/server";
import { ProspectService } from "@/modules/prospects";
import { updateProspectSchema } from "@/modules/prospects/schemas";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const prospect = await ProspectService.getProspectById(id);

  if (!prospect) {
    return NextResponse.json(
      { success: false, error: "Prospecto no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: prospect,
  });
});

export const PATCH = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const body = await request.json();

  const validationResult = updateProspectSchema.safeParse(body);

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

  const prospect = await ProspectService.updateProspect(id, validationResult.data);

  return NextResponse.json({
    success: true,
    data: prospect,
    message: "Prospecto actualizado exitosamente",
  });
});

export const DELETE = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  await ProspectService.deleteProspect(id);

  return NextResponse.json({
    success: true,
    message: "Prospecto eliminado exitosamente",
  });
});
