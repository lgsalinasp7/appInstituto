// ============================================
// AI Agent Service
// Handles token tracking, usage stats, and reporting
// ============================================

import { PrismaClient } from "@prisma/client";
import type {
  AgentStats,
  TokenUsage,
  FreeTierUsage,
  TokenTrendPoint,
  ModelDistribution,
  UsageLog,
  PaginatedUsageLogs,
  TopTenant,
  UsageLogsParams,
} from "../types/agent.types";
import { AiModelService } from "./ai-model.service";

const prisma = new PrismaClient();

export class AiAgentService {
  /**
   * Get dashboard statistics
   * @param tenantId - Optional tenant filter (null = platform-wide)
   */
  static async getAgentStats(tenantId?: string | null): Promise<AgentStats> {
    const now = new Date();
    const periodStart = this.getPeriodStart(now, "MONTHLY");
    const previousPeriodStart = this.getPeriodStart(
      new Date(periodStart.getTime() - 1),
      "MONTHLY"
    );

    // Current period stats
    const currentStats = await this.getStatsForPeriod(
      periodStart,
      now,
      tenantId
    );

    // Previous period stats for trends
    const previousStats = await this.getStatsForPeriod(
      previousPeriodStart,
      periodStart,
      tenantId
    );

    // Count active models
    const activeModels = await prisma.aiModel.count({
      where: { isActive: true },
    });

    // Calculate trends (% change)
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Get free tier usage
    const freeTierUsage = await this.getFreeTierUsage(tenantId);

    return {
      totalTokens: currentStats.totalTokens,
      totalMessages: currentStats.totalMessages,
      totalCostCOP: currentStats.totalCost / 100, // Convert cents to COP
      activeModels,
      freeTierUsage,
      currentPeriod: {
        start: periodStart,
        end: now,
      },
      trends: {
        tokensTrend: calculateTrend(
          currentStats.totalTokens,
          previousStats.totalTokens
        ),
        messagesTrend: calculateTrend(
          currentStats.totalMessages,
          previousStats.totalMessages
        ),
        costTrend: calculateTrend(
          currentStats.totalCost,
          previousStats.totalCost
        ),
      },
    };
  }

  /**
   * Get token consumption trends over time
   * @param period - "daily" or "monthly"
   * @param days - Number of days to look back
   * @param tenantId - Optional tenant filter
   */
  static async getTokenTrends(
    period: "daily" | "monthly",
    days: number,
    tenantId?: string | null
  ): Promise<TokenTrendPoint[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all messages in the date range
    const messages = await prisma.aiMessage.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(tenantId && {
          conversation: { tenantId },
        }),
        totalTokens: { not: null },
      },
      select: {
        createdAt: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        costInCents: true,
        modelUsed: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const trendsMap = new Map<string, TokenTrendPoint>();

    messages.forEach((msg) => {
      const dateKey =
        period === "daily"
          ? msg.createdAt.toISOString().split("T")[0]
          : `${msg.createdAt.getFullYear()}-${String(msg.createdAt.getMonth() + 1).padStart(2, "0")}`;

      const existing = trendsMap.get(dateKey) || {
        date: dateKey,
        tokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        messages: 0,
        cost: 0,
      };

      existing.tokens += msg.totalTokens || 0;
      existing.inputTokens += msg.inputTokens || 0;
      existing.outputTokens += msg.outputTokens || 0;
      existing.messages += 1;
      existing.cost += (msg.costInCents || 0) / 100;

      trendsMap.set(dateKey, existing);
    });

    return Array.from(trendsMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  /**
   * Get model usage distribution
   * @param tenantId - Optional tenant filter
   */
  static async getModelDistribution(
    tenantId?: string | null
  ): Promise<ModelDistribution[]> {
    const now = new Date();
    const periodStart = this.getPeriodStart(now, "MONTHLY");

    const messages = await prisma.aiMessage.findMany({
      where: {
        createdAt: { gte: periodStart },
        ...(tenantId && {
          conversation: { tenantId },
        }),
        modelUsed: { not: null },
        totalTokens: { not: null },
      },
      select: {
        modelUsed: true,
        totalTokens: true,
        costInCents: true,
      },
    });

    // Group by model
    const modelsMap = new Map<
      string,
      { tokens: number; messages: number; cost: number }
    >();

    messages.forEach((msg) => {
      const model = msg.modelUsed!;
      const existing = modelsMap.get(model) || {
        tokens: 0,
        messages: 0,
        cost: 0,
      };

      existing.tokens += msg.totalTokens || 0;
      existing.messages += 1;
      existing.cost += (msg.costInCents || 0) / 100;

      modelsMap.set(model, existing);
    });

    // Calculate total for percentages
    const totalTokens = Array.from(modelsMap.values()).reduce(
      (sum, m) => sum + m.tokens,
      0
    );

    // Get model names from database
    const modelConfigs = await AiModelService.getAllModels();
    const modelNameMap = new Map(
      modelConfigs.map((m) => [m.modelIdentifier, m.name])
    );

    // Convert to array with percentages
    const distribution: ModelDistribution[] = Array.from(
      modelsMap.entries()
    ).map(([identifier, data]) => ({
      model: identifier,
      modelName: modelNameMap.get(identifier) || identifier,
      tokens: data.tokens,
      percentage: totalTokens > 0 ? (data.tokens / totalTokens) * 100 : 0,
      messages: data.messages,
      cost: data.cost,
    }));

    return distribution.sort((a, b) => b.tokens - a.tokens);
  }

  /**
   * Get paginated usage logs
   */
  static async getUsageLogs(
    params: UsageLogsParams
  ): Promise<PaginatedUsageLogs> {
    const {
      page = 1,
      limit = 20,
      tenantId,
      modelId,
      startDate,
      endDate,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      totalTokens: { not: null },
    };

    if (tenantId) {
      where.conversation = { tenantId };
    }

    if (modelId) {
      where.modelUsed = modelId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [messages, total] = await Promise.all([
      prisma.aiMessage.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          role: true,
          modelUsed: true,
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          costInCents: true,
          conversationId: true,
          conversation: {
            select: {
              tenant: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.aiMessage.count({ where }),
    ]);

    // Get model names
    const modelConfigs = await AiModelService.getAllModels();
    const modelNameMap = new Map(
      modelConfigs.map((m) => [m.modelIdentifier, m.name])
    );

    const logs: UsageLog[] = messages.map((msg) => ({
      id: msg.id,
      timestamp: msg.createdAt,
      tenantName: msg.conversation.tenant?.name || null,
      tenantSlug: msg.conversation.tenant?.slug || null,
      model: msg.modelUsed || "unknown",
      modelName: modelNameMap.get(msg.modelUsed || "") || msg.modelUsed || "Unknown",
      inputTokens: msg.inputTokens || 0,
      outputTokens: msg.outputTokens || 0,
      totalTokens: msg.totalTokens || 0,
      cost: (msg.costInCents || 0) / 100,
      conversationId: msg.conversationId,
      messageRole: msg.role,
    }));

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get top tenants by consumption
   */
  static async getTopTenants(limit: number = 10): Promise<TopTenant[]> {
    const now = new Date();
    const periodStart = this.getPeriodStart(now, "MONTHLY");

    const messages = await prisma.aiMessage.findMany({
      where: {
        createdAt: { gte: periodStart },
        totalTokens: { not: null },
      },
      select: {
        totalTokens: true,
        costInCents: true,
        conversation: {
          select: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Group by tenant
    const tenantsMap = new Map<
      string,
      { name: string; slug: string; tokens: number; messages: number; cost: number }
    >();

    messages.forEach((msg) => {
      const tenant = msg.conversation.tenant;
      if (!tenant) return;

      const existing = tenantsMap.get(tenant.id) || {
        name: tenant.name,
        slug: tenant.slug,
        tokens: 0,
        messages: 0,
        cost: 0,
      };

      existing.tokens += msg.totalTokens || 0;
      existing.messages += 1;
      existing.cost += (msg.costInCents || 0) / 100;

      tenantsMap.set(tenant.id, existing);
    });

    // Calculate total for percentages
    const totalTokens = Array.from(tenantsMap.values()).reduce(
      (sum, t) => sum + t.tokens,
      0
    );

    // Convert to array
    const topTenants: TopTenant[] = Array.from(tenantsMap.entries())
      .map(([id, data]) => ({
        tenantId: id,
        tenantName: data.name,
        tenantSlug: data.slug,
        totalTokens: data.tokens,
        totalMessages: data.messages,
        totalCost: data.cost,
        percentage: totalTokens > 0 ? (data.tokens / totalTokens) * 100 : 0,
      }))
      .sort((a, b) => b.totalTokens - a.totalTokens)
      .slice(0, limit);

    return topTenants;
  }

  /**
   * Record token usage for a message
   * Called from the chat stream endpoint
   */
  static async recordTokenUsage(
    messageId: string,
    usage: TokenUsage
  ): Promise<void> {
    const { modelUsed, inputTokens, outputTokens, cached = false } = usage;
    const totalTokens = inputTokens + outputTokens;

    // Calculate cost
    const cost = await AiModelService.calculateCost(
      modelUsed,
      inputTokens,
      outputTokens
    );

    // Update message with token data
    await prisma.aiMessage.update({
      where: { id: messageId },
      data: {
        modelUsed,
        inputTokens,
        outputTokens,
        totalTokens,
        costInCents: cost.costInCents,
        cached,
      },
    });

    // Get message details for aggregation
    const message = await prisma.aiMessage.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          select: { tenantId: true },
        },
      },
    });

    if (!message) return;

    // Get model
    const model = await AiModelService.getModelByIdentifier(modelUsed);
    if (!model) return;

    // Aggregate into AiUsage table
    const period = this.getPeriodStart(new Date(), model.resetPeriod as any);

    await prisma.aiUsage.upsert({
      where: {
        tenantId_modelId_period: {
          tenantId: message.conversation.tenantId,
          modelId: model.id,
          period,
        },
      },
      create: {
        tenantId: message.conversation.tenantId,
        modelId: model.id,
        period,
        totalTokens,
        inputTokens,
        outputTokens,
        totalCostCents: cost.costInCents,
        messagesCount: 1,
      },
      update: {
        totalTokens: { increment: totalTokens },
        inputTokens: { increment: inputTokens },
        outputTokens: { increment: outputTokens },
        totalCostCents: { increment: cost.costInCents },
        messagesCount: { increment: 1 },
      },
    });
  }

  /**
   * Get free tier usage for a tenant
   */
  static async getFreeTierUsage(
    tenantId?: string | null
  ): Promise<FreeTierUsage> {
    // Get Gemini model (the one with free tier)
    const model = await AiModelService.getModelByIdentifier("gemini-2.0-flash");
    if (!model) {
      return {
        used: 0,
        limit: 100000,
        percentage: 0,
        remaining: 100000,
        resetDate: this.getNextResetDate("MONTHLY"),
        status: "safe",
      };
    }

    const period = this.getPeriodStart(new Date(), model.resetPeriod as any);

    // Get usage for this period
    const normalizedTenantId = tenantId !== undefined ? tenantId : null;
    const usage = await prisma.aiUsage.findFirst({
      where: {
        tenantId: normalizedTenantId,
        modelId: model.id,
        period,
      },
    });

    const used = usage?.totalTokens || 0;
    const limit = model.freeTokensLimit;
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const remaining = Math.max(0, limit - used);

    let status: "safe" | "warning" | "danger" = "safe";
    if (percentage >= 90) status = "danger";
    else if (percentage >= 70) status = "warning";

    return {
      used,
      limit,
      percentage,
      remaining,
      resetDate: this.getNextResetDate(model.resetPeriod as any),
      status,
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Get stats for a specific period
   */
  private static async getStatsForPeriod(
    startDate: Date,
    endDate: Date,
    tenantId?: string | null
  ) {
    const messages = await prisma.aiMessage.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(tenantId && {
          conversation: { tenantId },
        }),
        totalTokens: { not: null },
      },
      select: {
        totalTokens: true,
        costInCents: true,
      },
    });

    return {
      totalTokens: messages.reduce((sum, m) => sum + (m.totalTokens || 0), 0),
      totalMessages: messages.length,
      totalCost: messages.reduce((sum, m) => sum + (m.costInCents || 0), 0),
    };
  }

  /**
   * Get start of current period based on reset period type
   */
  private static getPeriodStart(
    date: Date,
    resetPeriod: "DAILY" | "MONTHLY" | "YEARLY"
  ): Date {
    const d = new Date(date);

    switch (resetPeriod) {
      case "DAILY":
        d.setHours(0, 0, 0, 0);
        return d;
      case "MONTHLY":
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
      case "YEARLY":
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }
  }

  /**
   * Get next reset date
   */
  private static getNextResetDate(
    resetPeriod: "DAILY" | "MONTHLY" | "YEARLY"
  ): Date {
    const now = new Date();
    const next = new Date(now);

    switch (resetPeriod) {
      case "DAILY":
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        return next;
      case "MONTHLY":
        next.setMonth(next.getMonth() + 1, 1);
        next.setHours(0, 0, 0, 0);
        return next;
      case "YEARLY":
        next.setFullYear(next.getFullYear() + 1, 0, 1);
        next.setHours(0, 0, 0, 0);
        return next;
    }
  }
}
