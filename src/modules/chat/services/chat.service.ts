/**
 * ChatService - Gestión de conversaciones y mensajes del agente IA
 */

import prisma from "@/lib/prisma";
import type {
  ConversationListItem,
  ConversationWithMessages,
  CreateConversationInput,
  AddMessageInput,
  Message,
} from "../types";

export class ChatService {
  /**
   * Obtiene todas las conversaciones de un usuario
   */
  static async getUserConversations(
    userId: string,
    tenantId: string
  ): Promise<ConversationListItem[]> {
    const conversations = await prisma.aiConversation.findMany({
      where: {
        userId,
        tenantId,
      },
      include: {
        messages: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 20,
    });

    return conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      messageCount: conv._count.messages,
      lastMessageAt: conv.messages[0]?.createdAt || conv.createdAt,
      createdAt: conv.createdAt,
    }));
  }

  /**
   * Obtiene una conversación con todos sus mensajes
   */
  static async getConversationById(
    id: string,
    userId: string,
    tenantId: string
  ): Promise<ConversationWithMessages | null> {
    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id,
        userId,
        tenantId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    return {
      id: conversation.id,
      title: conversation.title,
      userId: conversation.userId,
      tenantId: conversation.tenantId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        toolCalls: msg.toolCalls as unknown as Message["toolCalls"],
        toolResults: msg.toolResults as unknown as Message["toolResults"],
        createdAt: msg.createdAt,
      })),
    };
  }

  /**
   * Crea una nueva conversación
   */
  static async createConversation(
    userId: string,
    tenantId: string,
    data: CreateConversationInput
  ): Promise<ConversationWithMessages> {
    const conversation = await prisma.aiConversation.create({
      data: {
        userId,
        tenantId,
        title: data.title || "Nueva conversación",
      },
      include: {
        messages: true,
      },
    });

    return {
      id: conversation.id,
      title: conversation.title,
      userId: conversation.userId,
      tenantId: conversation.tenantId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: [],
    };
  }

  /**
   * Agrega un mensaje a una conversación
   */
  static async addMessage(
    data: AddMessageInput,
    userId: string,
    tenantId: string
  ): Promise<Message> {
    // Verificar que la conversación pertenece al usuario
    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: data.conversationId,
        userId,
        tenantId,
      },
    });

    if (!conversation) {
      throw new Error("Conversación no encontrada");
    }

    const message = await prisma.aiMessage.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        toolCalls: (data.toolCalls as object) || undefined,
        toolResults: (data.toolResults as object) || undefined,
      },
    });

    // Actualizar timestamp de la conversación
    await prisma.aiConversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    // Generar título automático si es el primer mensaje del usuario
    if (data.role === "user" && !conversation.title) {
      const title = data.content.substring(0, 50) + (data.content.length > 50 ? "..." : "");
      await prisma.aiConversation.update({
        where: { id: data.conversationId },
        data: { title },
      });
    }

    return {
      id: message.id,
      role: message.role as "user" | "assistant" | "system",
      content: message.content,
      toolCalls: message.toolCalls as unknown as Message["toolCalls"],
      toolResults: message.toolResults as unknown as Message["toolResults"],
      createdAt: message.createdAt,
    };
  }

  /**
   * Elimina una conversación
   */
  static async deleteConversation(
    id: string,
    userId: string,
    tenantId: string
  ): Promise<void> {
    await prisma.aiConversation.deleteMany({
      where: {
        id,
        userId,
        tenantId,
      },
    });
  }
}
