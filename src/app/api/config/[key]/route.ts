import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (
  request: NextRequest,
  user,
  tenantId,
  context?: { params: Promise<Record<string, string>> }
) => {
  const { key } = await context!.params;
  const config = await prisma.systemConfig.findFirst({
    where: { key, tenantId },
  });

  if (!config) {
    // Valor por defecto si no existe
    if (key === "MONTHLY_GOAL") {
      return NextResponse.json({ success: true, data: { key: "MONTHLY_GOAL", value: "10000000" } });
    }
    return NextResponse.json({ success: false, error: "Config not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: config });
});
