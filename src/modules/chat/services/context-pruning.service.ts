// ============================================
// Context Pruning Service
// Reduces input tokens by summarizing old messages
// ============================================

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import prisma from "@/lib/prisma";

interface PrunedContext {
  summary: string | null;
  recentMessages: Array<{ role: string; content: string }>;
  totalMessages: number;
  prunedCount: number;
}

export class ContextPruningService {
  private static readonly MAX_RECENT = 6;
  private static readonly SUMMARY_MAX_TOKENS = 200;

  /**
   * Prune conversation context: keep last N messages + summarize older ones
   */
  static async pruneContext(
    messages: Array<{ role: string; content: string }>,
    conversationId: string,
    maxRecent: number = this.MAX_RECENT
  ): Promise<PrunedContext> {
    const totalMessages = messages.length;

    // If few messages, no pruning needed
    if (totalMessages <= maxRecent) {
      return {
        summary: null,
        recentMessages: messages,
        totalMessages,
        prunedCount: 0,
      };
    }

    const recentMessages = messages.slice(-maxRecent);
    const olderMessages = messages.slice(0, -maxRecent);

    // Try to use cached summary
    const cachedSummary = await this.getCachedSummary(
      conversationId,
      totalMessages - maxRecent
    );

    if (cachedSummary) {
      return {
        summary: cachedSummary,
        recentMessages,
        totalMessages,
        prunedCount: olderMessages.length,
      };
    }

    // Generate new summary
    const summary = await this.summarizeMessages(olderMessages);

    // Cache the summary
    await this.cacheSummary(conversationId, summary, totalMessages - maxRecent);

    return {
      summary,
      recentMessages,
      totalMessages,
      prunedCount: olderMessages.length,
    };
  }

  /**
   * Summarize a list of messages into a concise paragraph
   */
  static async summarizeMessages(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const conversationText = messages
      .map((m) => `${m.role}: ${m.content.substring(0, 300)}`)
      .join("\n");

    try {
      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        maxOutputTokens: this.SUMMARY_MAX_TOKENS,
        temperature: 0.3,
        system:
          "Resume la siguiente conversación en máximo 3 oraciones en español. " +
          "Incluye solo los temas principales discutidos y datos clave mencionados. " +
          "No incluyas saludos ni despedidas.",
        prompt: conversationText,
      });
      return text;
    } catch (error) {
      console.error("[ContextPruning] Error summarizing:", error);
      // Fallback: simple truncation of older messages
      return messages
        .slice(-3)
        .map((m) => `${m.role}: ${m.content.substring(0, 100)}`)
        .join(" | ");
    }
  }

  /**
   * Estimate token count (rough: chars / 4)
   */
  static estimateTokenCount(
    messages: Array<{ role: string; content: string }>
  ): number {
    return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
  }

  /**
   * Get cached summary from AiConversation
   */
  private static async getCachedSummary(
    conversationId: string,
    upToIndex: number
  ): Promise<string | null> {
    try {
      const conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
        select: {
          summary: true,
          summaryUpToMessageIndex: true,
        },
      });

      if (
        conversation?.summary &&
        conversation.summaryUpToMessageIndex !== null &&
        conversation.summaryUpToMessageIndex >= upToIndex
      ) {
        return conversation.summary;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Cache summary in AiConversation
   */
  private static async cacheSummary(
    conversationId: string,
    summary: string,
    upToIndex: number
  ): Promise<void> {
    try {
      await prisma.aiConversation.update({
        where: { id: conversationId },
        data: {
          summary,
          summaryUpToMessageIndex: upToIndex,
        },
      });
    } catch (error) {
      console.error("[ContextPruning] Error caching summary:", error);
    }
  }
}
