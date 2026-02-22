/**
 * API Routes: Chat Conversations
 * GET /api/chat/conversations - Lista conversaciones del usuario
 * POST /api/chat/conversations - Crea una nueva conversación
 */

import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/modules/chat";
import { createConversationSchema } from "@/modules/chat/schemas";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const conversations = await ChatService.getUserConversations(user.id, tenantId);

  return NextResponse.json({
    success: true,
    data: conversations,
  });
});

export const POST = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const body = await request.json();

  const validationResult = createConversationSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Datos inválidos",
        details: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const conversation = await ChatService.createConversation(
    user.id,
    tenantId,
    validationResult.data
  );

  return NextResponse.json(
    {
      success: true,
      data: conversation,
      message: "Conversación creada exitosamente",
    },
    { status: 201 }
  );
});
