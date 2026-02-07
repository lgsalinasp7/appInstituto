import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;

  const filters = {
    advisorId: searchParams.get("advisorId") || undefined,
    programId: searchParams.get("programId") || undefined,
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
  };

  const report = await ReportsService.getFinancialReport(filters);

  return NextResponse.json({
    success: true,
    data: report,
  });
});
