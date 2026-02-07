import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";
import { withTenantAuth } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { studentId } = await context!.params;

  const status = await ContentService.getStudentContentStatus(studentId);

  if (!status) {
    return NextResponse.json(
      { success: false, error: "Estudiante no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: status,
  });
});
