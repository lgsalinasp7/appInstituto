import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/modules/students";
import { createStudentSchema } from "@/modules/students/schemas";
import type { StudentStatus } from "@/modules/students";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;

  // VENTAS solo ve sus propias matrículas (server-side enforcement)
  const isVentas = user.role?.name === "VENTAS";
  const effectiveAdvisorId = isVentas
    ? user.id
    : searchParams.get("advisorId") || undefined;

  const filters = {
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as StudentStatus) || undefined,
    programId: searchParams.get("programId") || undefined,
    advisorId: effectiveAdvisorId,
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
  };

  const result = await StudentService.getStudents(filters);

  return NextResponse.json({
    success: true,
    data: result,
  });
});

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
  const body = await request.json();
  
  const validationResult = createStudentSchema.safeParse(body);
  
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Datos inválidos",
        details: validationResult.error.flatten().fieldErrors 
      },
      { status: 400 }
    );
  }

  const student = await StudentService.createStudent(validationResult.data);

  return NextResponse.json({
    success: true,
    data: student,
    message: "Estudiante registrado exitosamente",
  }, { status: 201 });
});
