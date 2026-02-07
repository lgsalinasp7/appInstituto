import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const advisorId = searchParams.get("advisorId") || undefined;
  const programId = searchParams.get("programId") || undefined;

  const [stats, revenueChart] = await Promise.all([
    ReportsService.getDashboardStats(advisorId, programId),
    ReportsService.getRevenueChartData("month", advisorId)
  ]);

  return NextResponse.json({
    success: true,
    data: {
      ...stats,
      revenueChart
    },
  });
});
