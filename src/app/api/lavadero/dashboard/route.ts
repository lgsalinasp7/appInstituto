import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { getDashboardMetrics } from "@/modules/lavadero/services/lavadero-dashboard.service";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (_request, _user, tenantId) => {
    const data = await getDashboardMetrics(tenantId);
    return NextResponse.json({ success: true, data });
  }
);
