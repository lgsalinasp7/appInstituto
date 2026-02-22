import { prisma } from '@/lib/prisma';
import type { AgentMemory, AgentType } from '@prisma/client';
import type { AgentMemoryItem, AgentMemoryContext } from '../types';

export class AgentMemoryService {
  /**
   * Crear memoria
   */
  static async create(
    data: {
      agentType: AgentType;
      category: string;
      content: string;
      score?: number;
      metadata?: Record<string, unknown>;
    },
    tenantId: string
  ): Promise<AgentMemory> {
    return prisma.agentMemory.create({
      data: {
        agentType: data.agentType,
        category: data.category,
        content: data.content,
        score: data.score || 50,
        metadata: (data.metadata as any) || undefined,
        tenantId,
      },
    });
  }

  /**
   * Actualizar memoria (principalmente el score)
   */
  static async update(
    memoryId: string,
    data: {
      score?: number;
      content?: string;
      metadata?: Record<string, unknown>;
    },
    tenantId: string
  ): Promise<AgentMemory> {
    const updateData: any = {};
    if (data.score !== undefined) updateData.score = data.score;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.metadata !== undefined) updateData.metadata = data.metadata as any;

    return prisma.agentMemory.update({
      where: { id: memoryId, tenantId },
      data: updateData,
    });
  }

  /**
   * Obtener todas las memorias de un agente
   */
  static async getByAgent(agentType: AgentType, tenantId: string): Promise<AgentMemoryItem[]> {
    const memories = await prisma.agentMemory.findMany({
      where: { agentType, tenantId },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return memories.map(this.mapToMemoryItem);
  }

  /**
   * Obtener memorias por categoría
   */
  static async getByCategory(
    agentType: AgentType,
    category: string,
    tenantId: string
  ): Promise<AgentMemoryItem[]> {
    const memories = await prisma.agentMemory.findMany({
      where: { agentType, category, tenantId },
      orderBy: { score: 'desc' },
    });

    return memories.map(this.mapToMemoryItem);
  }

  /**
   * Obtener top memorias (score alto)
   */
  static async getTopMemories(
    agentType: AgentType,
    tenantId: string,
    limit: number = 10
  ): Promise<AgentMemoryItem[]> {
    const memories = await prisma.agentMemory.findMany({
      where: { agentType, tenantId },
      orderBy: { score: 'desc' },
      take: limit,
    });

    return memories.map(this.mapToMemoryItem);
  }

  /**
   * Obtener contexto de memoria para system prompt
   */
  static async getMemoryContext(
    agentType: AgentType,
    tenantId: string
  ): Promise<AgentMemoryContext> {
    const topMemories = await this.getTopMemories(agentType, tenantId, 5);

    // Extraer estrategias (categoría 'estrategia')
    const strategies = await this.getByCategory(agentType, 'estrategia', tenantId);
    const topStrategies = strategies.slice(0, 3).map(m => m.content);

    // Extraer lecciones (categoría 'leccion')
    const lessons = await this.getByCategory(agentType, 'leccion', tenantId);
    const topLessons = lessons.slice(0, 3).map(m => m.content);

    return {
      memories: topMemories,
      topStrategies,
      lessons: topLessons,
    };
  }

  /**
   * Formatear memoria como texto para system prompt
   */
  static formatMemoryForPrompt(context: AgentMemoryContext): string {
    let prompt = '';

    if (context.topStrategies.length > 0) {
      prompt += '\n## Estrategias Efectivas:\n';
      context.topStrategies.forEach((strategy, i) => {
        prompt += `${i + 1}. ${strategy}\n`;
      });
    }

    if (context.lessons.length > 0) {
      prompt += '\n## Lecciones Aprendidas:\n';
      context.lessons.forEach((lesson, i) => {
        prompt += `${i + 1}. ${lesson}\n`;
      });
    }

    if (context.memories.length > 0) {
      prompt += '\n## Memorias Destacadas:\n';
      context.memories.forEach((memory, i) => {
        prompt += `${i + 1}. [${memory.category}] ${memory.content} (score: ${memory.score})\n`;
      });
    }

    return prompt;
  }

  /**
   * Incrementar score de memoria
   */
  static async incrementScore(memoryId: string, increment: number, tenantId: string): Promise<AgentMemory> {
    const memory = await prisma.agentMemory.findFirst({
      where: { id: memoryId, tenantId },
    });

    if (!memory) {
      throw new Error('Memory not found');
    }

    const newScore = Math.min(100, memory.score + increment);

    return prisma.agentMemory.update({
      where: { id: memoryId },
      data: { score: newScore },
    });
  }

  /**
   * Decrementar score de memoria
   */
  static async decrementScore(memoryId: string, decrement: number, tenantId: string): Promise<AgentMemory> {
    const memory = await prisma.agentMemory.findFirst({
      where: { id: memoryId, tenantId },
    });

    if (!memory) {
      throw new Error('Memory not found');
    }

    const newScore = Math.max(0, memory.score - decrement);

    return prisma.agentMemory.update({
      where: { id: memoryId },
      data: { score: newScore },
    });
  }

  /**
   * Guardar resultado de interacción como memoria
   */
  static async saveInteractionResult(
    agentType: AgentType,
    category: string,
    content: string,
    wasSuccessful: boolean,
    tenantId: string
  ): Promise<AgentMemory> {
    const initialScore = wasSuccessful ? 70 : 30;

    return this.create(
      {
        agentType,
        category,
        content,
        score: initialScore,
        metadata: {
          wasSuccessful,
          createdFromInteraction: true,
        } as Record<string, unknown>,
      },
      tenantId
    );
  }

  /**
   * Limpiar memorias con score bajo
   */
  static async cleanLowScoreMemories(agentType: AgentType, tenantId: string, threshold: number = 20): Promise<number> {
    const result = await prisma.agentMemory.deleteMany({
      where: {
        agentType,
        tenantId,
        score: { lt: threshold },
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // más de 30 días
        },
      },
    });

    return result.count;
  }

  /**
   * Helpers
   */
  private static mapToMemoryItem(memory: AgentMemory): AgentMemoryItem {
    return {
      id: memory.id,
      agentType: memory.agentType,
      category: memory.category,
      content: memory.content,
      score: memory.score,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      metadata: (memory.metadata as Record<string, unknown>) || undefined,
    };
  }
}
