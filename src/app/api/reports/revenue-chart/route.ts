import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const period = (searchParams.get("period") as "week" | "month") || "month";
  const advisorId = searchParams.get("advisorId") || undefined;

  const chartData = await ReportsService.getRevenueChartData(period, advisorId);

  return NextResponse.json({
    success: true,
    data: chartData,
  });
});
