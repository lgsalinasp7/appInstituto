import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

async function resolveTenantId(req: NextRequest, userId: string, userTenantId?: string | null) {
  if (userTenantId) return userTenantId;

  const tenantSlug = req.headers.get("x-tenant-slug");
  if (tenantSlug && tenantSlug !== "admin") {
    const tenantFromSlug = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });
    if (tenantFromSlug) return tenantFromSlug.id;
  }

  const userWithPlatformRole = await prisma.user.findUnique({
    where: { id: userId },
    select: { platformRole: true },
  });

  if (!userWithPlatformRole?.platformRole) return null;

  const defaultTenant = await prisma.tenant.findFirst({
    where: { status: "ACTIVO" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return defaultTenant?.id ?? null;
}

export const GET = withAuth(async (req: NextRequest, user) => {
  const tenantId = await resolveTenantId(req, user.id, user.tenantId);
  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "No se pudo determinar el tenant" },
      { status: 401 }
    );
  }

  const config = await prisma.systemConfig.findUnique({
    where: { key_tenantId: { key: "telegram_chat_id", tenantId } },
  });

  return NextResponse.json({
    success: true,
    data: config ?? { key: "telegram_chat_id", value: "" },
  });
});

export const PUT = withAuth(async (req: NextRequest, user) => {
  const tenantId = await resolveTenantId(req, user.id, user.tenantId);
  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "No se pudo determinar el tenant" },
      { status: 401 }
    );
  }

  const body = await req.json();
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
});
