
import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;

  const filters = {
    advisorId: searchParams.get("advisorId") || undefined,
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
  };

  const stats = await PaymentService.getPaymentStats(filters);

  return NextResponse.json({
    success: true,
    data: stats,
  });
});
