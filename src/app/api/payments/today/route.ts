import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const result = await PaymentService.getTodayPayments();

  return NextResponse.json({
    success: true,
    data: result,
  });
});
