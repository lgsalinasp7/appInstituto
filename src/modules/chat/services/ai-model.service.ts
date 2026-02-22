// ============================================
// AI Model Service
// Handles CRUD operations for AI models
// ============================================

import { PrismaClient, AiModel, Prisma } from "@prisma/client";
import type { AiModelConfig, CostCalculation } from "../types/agent.types";

const prisma = new PrismaClient();

export class AiModelService {
  /**
   * Get all active AI models
   */
  static async getActiveModels(): Promise<AiModelConfig[]> {
    const models = await prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return models.map((m) => this.toModelConfig(m));
  }

  /**
   * Get all AI models (including inactive)
   */
  static async getAllModels(): Promise<AiModelConfig[]> {
    const models = await prisma.aiModel.findMany({
      orderBy: { createdAt: "desc" },
    });

    return models.map((m) => this.toModelConfig(m));
  }

  /**
   * Get model by identifier (e.g., "gemini-2.0-flash")
   */
  static async getModelByIdentifier(
    identifier: string
  ): Promise<AiModelConfig | null> {
    const model = await prisma.aiModel.findUnique({
      where: { modelIdentifier: identifier },
    });

    if (!model) return null;
    return this.toModelConfig(model);
  }

  /**
   * Get model by ID
   */
  static async getModelById(id: string): Promise<AiModelConfig | null> {
    const model = await prisma.aiModel.findUnique({
      where: { id },
    });

    if (!model) return null;
    return this.toModelConfig(model);
  }

  /**
   * Create a new AI model configuration
   * @param data - Model configuration data
   */
  static async createModel(
    data: Omit<AiModelConfig, "id">
  ): Promise<AiModelConfig> {
    const model = await prisma.aiModel.create({
      data: {
        name: data.name,
        provider: data.provider,
        modelIdentifier: data.modelIdentifier,
        freeTokensLimit: data.freeTokensLimit,
        inputCostPer1k: new Prisma.Decimal(data.inputCostPer1k),
        outputCostPer1k: new Prisma.Decimal(data.outputCostPer1k),
        isActive: data.isActive,
        resetPeriod: data.resetPeriod,
      },
    });

    return this.toModelConfig(model);
  }

  /**
   * Update an existing AI model configuration
   */
  static async updateModel(
    id: string,
    data: Partial<Omit<AiModelConfig, "id">>
  ): Promise<AiModelConfig> {
    const updateData: Prisma.AiModelUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.provider !== undefined) updateData.provider = data.provider;
    if (data.modelIdentifier !== undefined)
      updateData.modelIdentifier = data.modelIdentifier;
    if (data.freeTokensLimit !== undefined)
      updateData.freeTokensLimit = data.freeTokensLimit;
    if (data.inputCostPer1k !== undefined)
      updateData.inputCostPer1k = new Prisma.Decimal(data.inputCostPer1k);
    if (data.outputCostPer1k !== undefined)
      updateData.outputCostPer1k = new Prisma.Decimal(data.outputCostPer1k);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.resetPeriod !== undefined)
      updateData.resetPeriod = data.resetPeriod;

    const model = await prisma.aiModel.update({
      where: { id },
      data: updateData,
    });

    return this.toModelConfig(model);
  }

  /**
   * Delete an AI model (soft delete by setting isActive = false)
   */
  static async deleteModel(id: string): Promise<void> {
    await prisma.aiModel.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Calculate cost for a given token usage
   * @param modelId - Model ID or identifier
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns Cost calculation in COP
   */
  static async calculateCost(
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<CostCalculation> {
    // Try to find model by ID first, then by identifier
    let model = await prisma.aiModel.findUnique({ where: { id: modelId } });
    if (!model) {
      model = await prisma.aiModel.findUnique({
        where: { modelIdentifier: modelId },
      });
    }

    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Calculate costs (prices are per 1k tokens)
    const inputCost =
      (inputTokens / 1000) * Number(model.inputCostPer1k);
    const outputCost =
      (outputTokens / 1000) * Number(model.outputCostPer1k);
    const totalCost = inputCost + outputCost;

    // Convert to cents for storage (multiply by 100)
    const costInCents = Math.round(totalCost * 100);

    return {
      inputCost,
      outputCost,
      totalCost,
      costInCents,
    };
  }

  /**
   * Helper: Convert Prisma model to typed config
   */
  private static toModelConfig(model: AiModel): AiModelConfig {
    return {
      id: model.id,
      name: model.name,
      provider: model.provider,
      modelIdentifier: model.modelIdentifier,
      freeTokensLimit: model.freeTokensLimit,
      inputCostPer1k: Number(model.inputCostPer1k),
      outputCostPer1k: Number(model.outputCostPer1k),
      isActive: model.isActive,
      resetPeriod: model.resetPeriod as "DAILY" | "MONTHLY" | "YEARLY",
    };
  }
}
