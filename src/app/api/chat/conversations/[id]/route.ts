/**
 * API Routes: Conversación Individual
 * GET /api/chat/conversations/:id - Obtiene una conversación con mensajes
 * DELETE /api/chat/conversations/:id - Elimina una conversación
 */

import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/modules/chat";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(
  async (request: NextRequest, user, tenantId, context) => {
    const { id } = await context!.params;
    const conversation = await ChatService.getConversationById(id, user.id, tenantId);

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversación no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  }
);

export const DELETE = withTenantAuth(
  async (request: NextRequest, user, tenantId, context) => {
    const { id } = await context!.params;
    await ChatService.deleteConversation(id, user.id, tenantId);

    return NextResponse.json({
      success: true,
      message: "Conversación eliminada exitosamente",
    });
  }
);
