import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;

  // VENTAS solo ve sus propias métricas (server-side enforcement)
  const isVentas = user.role?.name === "VENTAS";
  const advisorId = isVentas
    ? user.id
    : searchParams.get("advisorId") || undefined;
  const programId = searchParams.get("programId") || undefined;

  const [stats, revenueChart] = await Promise.all([
    ReportsService.getDashboardStats(tenantId, advisorId, programId),
    ReportsService.getRevenueChartData(tenantId, "month", advisorId),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      ...stats,
      revenueChart
    },
  });
});
