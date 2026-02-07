import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const advisorId = searchParams.get("advisorId") || undefined;

  const pendingDeliveries = await ContentService.getPendingDeliveries(advisorId);

  return NextResponse.json({
    success: true,
    data: pendingDeliveries,
  });
});
