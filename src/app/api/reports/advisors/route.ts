import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const reports = await ReportsService.getAdvisorReports();

  return NextResponse.json({
    success: true,
    data: reports,
  });
});
