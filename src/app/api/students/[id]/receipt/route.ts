import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/modules/students/services/student.service";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (
  request: NextRequest,
  user,
  tenantId,
  context?: { params: Promise<Record<string, string>> }
) => {
  const { id } = await context!.params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID de estudiante requerido" },
      { status: 400 }
    );
  }

  const receiptData = await StudentService.getMatriculaReceipt(id);

  return NextResponse.json({ success: true, data: receiptData });
});
