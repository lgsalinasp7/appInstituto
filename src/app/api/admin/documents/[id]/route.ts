/**
 * API Route: Admin Document by ID (RAG)
 * DELETE /api/admin/documents/[id] - Delete a document
 */

import { NextRequest, NextResponse } from "next/server";
import { withTenantAuth } from "@/lib/api-auth";
import { RAGService } from "@/modules/chat/services/rag.service";

export const DELETE = withTenantAuth(
  async (
    _request: NextRequest,
    _user,
    tenantId,
    context
  ) => {
    const params = await context!.params;
    const id = params.id;

    await RAGService.deleteDocument(id, tenantId);

    return NextResponse.json({
      success: true,
      message: "Documento eliminado exitosamente",
    });
  }
);
