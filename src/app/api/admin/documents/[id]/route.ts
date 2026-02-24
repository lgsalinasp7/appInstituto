/**
 * API Route: Admin Document by ID (RAG)
 * DELETE /api/admin/documents/[id] - Delete a document
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { RAGService } from "@/modules/chat/services/rag.service";
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

export const DELETE = withAuth(
  async (
    request: NextRequest,
    user,
    context
  ) => {
    const tenantId = await resolveTenantId(request, user.id, user.tenantId);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "No se pudo determinar el tenant" },
        { status: 401 }
      );
    }

    const params = await context!.params;
    const id = params.id;

    await RAGService.deleteDocument(id, tenantId);

    return NextResponse.json({
      success: true,
      message: "Documento eliminado exitosamente",
    });
  }
);
