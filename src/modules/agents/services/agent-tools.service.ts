// @ts-nocheck - AI SDK v6 has type inference limitations with tool() helper
import { tool } from 'ai';
import { z } from 'zod';
import { AgentTaskService } from './agent-task.service';
import { AgentMemoryService } from './agent-memory.service';
import type { AgentType } from '@prisma/client';

export class AgentToolsService {
  /**
   * Herramienta permitida: crear tareas operativas.
   * Nota: el dominio de leads tenant fue removido por política de separación.
   */
  static createAgentTaskTool(tenantId: string, agentType: AgentType) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Crea una tarea interna en el tablero del agente',
      inputSchema: z.object({
        title: z.string().describe('Título de la tarea'),
        description: z.string().describe('Descripción detallada'),
        priority: z
          .number()
          .int()
          .min(0)
          .max(2)
          .default(0)
          .describe('Prioridad: 0=normal, 1=alta, 2=urgente'),
      }),
      execute: async ({ title, description, priority }) => {
        try {
          const task = await AgentTaskService.createTask(
            {
              title,
              description,
              agentType,
              priority: priority || 0,
            },
            tenantId
          );

          return {
            success: true,
            taskId: task.id,
            message: 'Tarea creada exitosamente',
          };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Herramienta permitida: memoria del agente.
   */
  static logMemoryTool(tenantId: string, agentType: AgentType) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description:
        'Guarda una memoria, estrategia o lección aprendida para mejorar en el futuro',
      inputSchema: z.object({
        category: z
          .string()
          .describe(
            'Categoría: estrategia, leccion, patron_conversion, manejo_objeciones, etc.'
          ),
        content: z.string().describe('Contenido de la memoria o lección'),
        score: z
          .number()
          .int()
          .min(0)
          .max(100)
          .default(50)
          .describe('Score inicial (0-100)'),
      }),
      execute: async ({ category, content, score }) => {
        try {
          const memory = await AgentMemoryService.create(
            {
              agentType,
              category,
              content,
              score,
            },
            tenantId
          );

          return {
            success: true,
            memoryId: memory.id,
            message: 'Memoria guardada',
          };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  static getMargyTools(tenantId: string) {
    return {
      createAgentTask: this.createAgentTaskTool(tenantId, 'MARGY'),
      logMemory: this.logMemoryTool(tenantId, 'MARGY'),
    };
  }

  static getKaledTools(tenantId: string) {
    return {
      createAgentTask: this.createAgentTaskTool(tenantId, 'KALED'),
      logMemory: this.logMemoryTool(tenantId, 'KALED'),
    };
  }
}
