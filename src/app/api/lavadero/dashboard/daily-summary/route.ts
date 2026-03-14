import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { getDailySummary } from "@/modules/lavadero/services/lavadero-payment.service";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (request, _user, tenantId) => {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();

    const data = await getDailySummary(tenantId, date);
    return NextResponse.json({ success: true, data });
  }
);
