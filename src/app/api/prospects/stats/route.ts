import { NextRequest, NextResponse } from "next/server";
import { ProspectService } from "@/modules/prospects";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const advisorId = searchParams.get("advisorId") || undefined;

  const stats = await ProspectService.getStats(advisorId);

  return NextResponse.json({
    success: true,
    data: stats,
  });
});
