
import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const result = await PaymentService.getDebts({
    search: searchParams.get("search") || undefined,
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
  });

  return NextResponse.json({
    success: true,
    data: result,
  });
});
