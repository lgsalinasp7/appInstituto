/**
 * API Route: Admin Documents (RAG)
 * GET /api/admin/documents - List all documents
 * POST /api/admin/documents - Ingest a new document
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { RAGService } from "@/modules/chat/services/rag.service";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  category: z.enum(["reglamento", "manual", "programa", "faq"]),
});

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

export const GET = withAuth(async (request: NextRequest, user) => {
  const tenantId = await resolveTenantId(request, user.id, user.tenantId);
  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "No se pudo determinar el tenant" },
      { status: 401 }
    );
  }

  const documents = await RAGService.listDocuments(tenantId);

  return NextResponse.json({
    success: true,
    data: documents,
  });
});

export const POST = withAuth(async (request: NextRequest, user) => {
  const tenantId = await resolveTenantId(request, user.id, user.tenantId);
  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "No se pudo determinar el tenant" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = createDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const documentId = await RAGService.ingestDocument(parsed.data, tenantId);

  return NextResponse.json({
    success: true,
    data: { id: documentId },
    message: "Documento ingresado exitosamente",
  });
});
