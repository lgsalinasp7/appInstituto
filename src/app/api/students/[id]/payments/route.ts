import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/modules/students";
import { withTenantAuth } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  const summary = await StudentService.getStudentPaymentsSummary(id);

  if (!summary) {
    return NextResponse.json(
      { success: false, error: "Estudiante no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: summary,
  });
});
