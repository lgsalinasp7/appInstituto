import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/modules/reports";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const aging = await ReportsService.getPortfolioAging();

  return NextResponse.json({
    success: true,
    data: aging,
  });
});
