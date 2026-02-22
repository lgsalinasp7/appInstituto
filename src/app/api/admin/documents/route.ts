/**
 * API Route: Admin Documents (RAG)
 * GET /api/admin/documents - List all documents
 * POST /api/admin/documents - Ingest a new document
 */

import { NextRequest, NextResponse } from "next/server";
import { withTenantAuth } from "@/lib/api-auth";
import { RAGService } from "@/modules/chat/services/rag.service";
import { z } from "zod";

const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  category: z.enum(["reglamento", "manual", "programa", "faq"]),
});

export const GET = withTenantAuth(async (_request: NextRequest, _user, tenantId) => {
  const documents = await RAGService.listDocuments(tenantId);

  return NextResponse.json({
    success: true,
    data: documents,
  });
});

export const POST = withTenantAuth(async (request: NextRequest, _user, tenantId) => {
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
