import { NextRequest, NextResponse } from "next/server";
import { withPlatformAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { resolveKaledTenantId } from "@/lib/kaled-tenant";

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: any) => {
    const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));

    const config = await prisma.systemConfig.findUnique({
      where: { key_tenantId: { key: "telegram_chat_id", tenantId } },
    });

    return NextResponse.json({
      success: true,
      data: config ?? { key: "telegram_chat_id", value: "" },
    });
  }
);

export const PUT = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: any) => {
    const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));

    const body = await request.json();
    const value = String(body?.value ?? "").trim();

    if (!value) {
      return NextResponse.json(
        { success: false, error: "El Chat ID es requerido" },
        { status: 400 }
      );
    }

    const config = await prisma.systemConfig.upsert({
      where: { key_tenantId: { key: "telegram_chat_id", tenantId } },
      create: { key: "telegram_chat_id", value, tenantId },
      update: { value },
    });

    return NextResponse.json({ success: true, data: config });
  }
);
