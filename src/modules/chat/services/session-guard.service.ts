// ============================================
// Session Guard Service
// Rate limiting: per-conversation and per-day message limits
// ============================================

import prisma from "@/lib/prisma";
import { SESSION_LIMITS, type SessionLimitResult } from "../types/agent.types";

export class SessionGuardService {
  /**
   * Check if user is allowed to send a message
   */
  static async checkSessionLimits(
    userId: string,
    conversationId: string,
    tenantId: string
  ): Promise<SessionLimitResult> {
    // Check conversation message count
    const conversationCount = await prisma.aiMessage.count({
      where: {
        conversationId,
        role: "user",
      },
    });

    if (conversationCount >= SESSION_LIMITS.maxMessagesPerConversation) {
      return {
        allowed: false,
        reason: `Has alcanzado el límite de ${SESSION_LIMITS.maxMessagesPerConversation} mensajes en esta conversación. Por favor, inicia una nueva conversación.`,
        remaining: 0,
      };
    }

    // Check daily message count
    const dailyCount = await this.getUserDailyMessageCount(userId, tenantId);

    if (dailyCount >= SESSION_LIMITS.maxMessagesPerDay) {
      return {
        allowed: false,
        reason: `Has alcanzado el límite diario de ${SESSION_LIMITS.maxMessagesPerDay} mensajes. El límite se restablece a medianoche.`,
        remaining: 0,
      };
    }

    const conversationRemaining =
      SESSION_LIMITS.maxMessagesPerConversation - conversationCount;
    const dailyRemaining = SESSION_LIMITS.maxMessagesPerDay - dailyCount;
    const remaining = Math.min(conversationRemaining, dailyRemaining);

    return {
      allowed: true,
      remaining,
    };
  }

  /**
   * Count user messages sent today
   */
  static async getUserDailyMessageCount(
    userId: string,
    tenantId: string
  ): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return prisma.aiMessage.count({
      where: {
        role: "user",
        createdAt: { gte: todayStart },
        conversation: {
          userId,
          tenantId,
        },
      },
    });
  }
}
