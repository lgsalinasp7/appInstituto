// ============================================
// Response Cache Service
// Caches AI responses to avoid redundant model calls
// ============================================

import { createHash } from "crypto";
import prisma from "@/lib/prisma";

// TTL in hours by tool used
const TTL_BY_TOOL: Record<string, number> = {
  getProgramInfo: 24,
  getStudentStats: 1,
  getCarteraReport: 0.5, // 30 minutes
  getAdvisorPerformance: 1,
};

// Tools that should never be cached
const NEVER_CACHE_TOOLS = ["searchStudents"];

interface CachedResponse {
  response: string;
  toolsUsed: string[];
  hitCount: number;
}

export class ResponseCacheService {
  /**
   * Look up a cached response for this query + tenant
   */
  static async getCachedResponse(
    query: string,
    tenantId: string
  ): Promise<CachedResponse | null> {
    const normalized = this.normalizeQuery(query);
    const hash = this.hashQuery(normalized);

    try {
      const cached = await prisma.aiResponseCache.findUnique({
        where: {
          tenantId_queryHash: { tenantId, queryHash: hash },
        },
      });

      if (!cached) return null;

      // Check expiration
      if (cached.expiresAt < new Date()) {
        // Expired - delete and return null
        await prisma.aiResponseCache.delete({
          where: { id: cached.id },
        }).catch(() => {});
        return null;
      }

      // Update hit count
      await prisma.aiResponseCache.update({
        where: { id: cached.id },
        data: {
          hitCount: { increment: 1 },
          lastHitAt: new Date(),
        },
      }).catch(() => {});

      return {
        response: cached.response,
        toolsUsed: (cached.toolsUsed as string[]) || [],
        hitCount: cached.hitCount + 1,
      };
    } catch (error) {
      console.error("[ResponseCache] Error reading cache:", error);
      return null;
    }
  }

  /**
   * Cache a response for future use
   */
  static async cacheResponse(
    query: string,
    response: string,
    toolsUsed: string[],
    tenantId: string,
    ttlHours?: number
  ): Promise<void> {
    if (!this.isCacheable(query, toolsUsed)) return;

    const normalized = this.normalizeQuery(query);
    const hash = this.hashQuery(normalized);
    const ttl = ttlHours ?? this.getTTL(toolsUsed);
    const expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);

    try {
      await prisma.aiResponseCache.upsert({
        where: {
          tenantId_queryHash: { tenantId, queryHash: hash },
        },
        create: {
          queryHash: hash,
          queryNormalized: normalized,
          response,
          toolsUsed: toolsUsed,
          expiresAt,
          tenantId,
        },
        update: {
          response,
          toolsUsed: toolsUsed,
          expiresAt,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("[ResponseCache] Error writing cache:", error);
    }
  }

  /**
   * Determine if a query + tools combination is cacheable
   */
  static isCacheable(query: string, toolsUsed: string[]): boolean {
    // Never cache if any tool in the NEVER_CACHE list was used
    if (toolsUsed.some((t) => NEVER_CACHE_TOOLS.includes(t))) {
      return false;
    }
    // Don't cache very short queries (likely greetings)
    if (query.trim().length < 10) return false;
    return true;
  }

  /**
   * Normalize query: lowercase, trim, remove punctuation
   */
  static normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[¿?!¡.,;:()]/g, "")
      .replace(/\s+/g, " ");
  }

  /**
   * SHA-256 hash of normalized query
   */
  private static hashQuery(normalized: string): string {
    return createHash("sha256").update(normalized).digest("hex");
  }

  /**
   * Determine TTL based on tools used
   */
  private static getTTL(toolsUsed: string[]): number {
    if (toolsUsed.length === 0) return 4; // General queries: 4 hours

    // Use the shortest TTL among all tools used
    let minTTL = 24;
    for (const tool of toolsUsed) {
      const ttl = TTL_BY_TOOL[tool];
      if (ttl !== undefined && ttl < minTTL) {
        minTTL = ttl;
      }
    }
    return minTTL;
  }

  /**
   * Clean up expired cache entries (call periodically)
   */
  static async cleanExpired(): Promise<number> {
    const result = await prisma.aiResponseCache.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}
