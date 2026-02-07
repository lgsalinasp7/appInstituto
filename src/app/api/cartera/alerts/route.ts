import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const advisorId = searchParams.get("advisorId") || undefined;

  const alerts = await CarteraService.getAlerts(advisorId);

  return NextResponse.json({
    success: true,
    data: alerts,
  });
});
