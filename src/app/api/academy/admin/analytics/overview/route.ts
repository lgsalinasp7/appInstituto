import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { analyticsService } from "@/modules/academy/services/academy.service";

/**
 * GET — Resumen de analytics del tenant (solo ACADEMY_ADMIN).
 */
export const GET = withAcademyAuth(["ACADEMY_ADMIN"], async (_request, _user, tenantId) => {
  const data = await analyticsService.getTenantOverview(tenantId);
  return NextResponse.json({ success: true, data });
});
