import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/modules/students";
import { updateStudentSchema } from "@/modules/students/schemas";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const student = await StudentService.getStudentById(id);

  if (!student) {
    return NextResponse.json(
      { success: false, error: "Estudiante no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: student,
  });
});

export const PATCH = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const body = await request.json();

  const validationResult = updateStudentSchema.safeParse(body);

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

  const student = await StudentService.updateStudent(id, validationResult.data);

  return NextResponse.json({
    success: true,
    data: student,
    message: "Estudiante actualizado exitosamente",
  });
});

export const DELETE = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  await StudentService.deleteStudent(id);

  return NextResponse.json({
    success: true,
    message: "Estudiante eliminado exitosamente",
  });
});
