import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withTenantAuthAndCSRF } from "@/lib/api-auth";

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
  const { key, value } = await request.json();

  if (!key || value === undefined) {
    return NextResponse.json({ success: false, error: "Key and value are required" }, { status: 400 });
  }

  const config = await prisma.systemConfig.upsert({
    where: { 
      key_tenantId: { key, tenantId },
    },
    update: { value },
    create: { key, value, tenantId },
  });

  return NextResponse.json({ success: true, data: config });
});
