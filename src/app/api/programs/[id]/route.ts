import { NextRequest, NextResponse } from "next/server";
import { ProgramService } from "@/modules/programs";
import { z } from "zod";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

const updateProgramSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  totalValue: z.coerce.number().min(0).optional(),
  matriculaValue: z.coerce.number().min(0).optional(),
  modulesCount: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withTenantAuth(async (request, user, tenantId, context) => {
  const { id } = await context!.params;

  try {
    const program = await ProgramService.getProgramById(id);

    if (!program) {
      return NextResponse.json(
        { success: false, error: "Programa no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener programa" },
      { status: 500 }
    );
  }
});

export const PUT = withTenantAuthAndCSRF(async (request, user, tenantId, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();

    const validationResult = updateProgramSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos invalidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const program = await ProgramService.updateProgram(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: program,
      message: "Programa actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar programa" },
      { status: 500 }
    );
  }
});

export const DELETE = withTenantAuthAndCSRF(async (request, user, tenantId, context) => {
  const { id } = await context!.params;

  try {
    await ProgramService.deleteProgram(id);

    return NextResponse.json({
      success: true,
      message: "Programa eliminado exitosamente",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar programa";

    if (message.includes("estudiantes matriculados")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 409 }
      );
    }

    console.error("Error deleting program:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
});
