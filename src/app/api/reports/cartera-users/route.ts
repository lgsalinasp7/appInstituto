import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const period = (searchParams.get("period") as "month" | "3months" | "year") || "month";

  const reports = await ReportsService.getCarteraUserReports(period);

  return NextResponse.json({
    success: true,
    data: reports,
  });
});
