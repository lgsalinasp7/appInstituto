// @ts-nocheck - AI SDK v6 has type inference limitations with tool() helper
import { prisma } from '@/lib/prisma';
import { tool } from 'ai';
import { z } from 'zod';
import { WhatsAppService } from '@/modules/whatsapp/services/whatsapp.service';
import { EmailEngineService } from '@/modules/email-sequences';
import { FunnelService } from '@/modules/funnel';
import { AgentTaskService } from './agent-task.service';
import { AgentMemoryService } from './agent-memory.service';
import type { AgentType } from '@prisma/client';

export class AgentToolsService {
  /**
   * Obtener información de un prospect
   */
  static getProspectInfoTool(tenantId: string) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Obtiene información completa de un prospect por su ID',
      inputSchema: z.object({
        prospectId: z.string().describe('ID del prospect'),
      }),
      execute: async ({ prospectId }) => {
        const prospect = await prisma.prospect.findFirst({
          where: { id: prospectId, tenantId },
          include: {
            program: true,
            advisor: { select: { name: true, email: true } },
            interactions: {
              take: 10,
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        if (!prospect) {
          return { error: 'Prospect not found' };
        }

        return {
          id: prospect.id,
          name: prospect.name,
          phone: prospect.phone,
          email: prospect.email,
          funnelStage: prospect.funnelStage,
          temperature: prospect.temperature,
          score: prospect.score,
          source: prospect.source,
          program: prospect.program?.name,
          advisor: prospect.advisor.name,
          lastContactAt: prospect.lastContactAt,
          recentInteractions: prospect.interactions.map(i => ({
            type: i.type,
            content: i.content,
            createdAt: i.createdAt,
          })),
        };
      },
    });
  }

  /**
   * Actualizar etapa del funnel de un prospect
   */
  static updateProspectStageTool(tenantId: string) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Mueve un prospect a una nueva etapa del funnel',
      inputSchema: z.object({
        prospectId: z.string().describe('ID del prospect'),
        newStage: z.enum([
          'NUEVO', 'CONTACTADO', 'INTERESADO',
          'MASTERCLASS_REGISTRADO', 'MASTERCLASS_ASISTIO',
          'APLICACION', 'LLAMADA_AGENDADA', 'LLAMADA_REALIZADA',
          'NEGOCIACION', 'MATRICULADO', 'PERDIDO',
        ]).describe('Nueva etapa del funnel'),
        reason: z.string().optional().describe('Razón del cambio'),
      }),
      execute: async ({ prospectId, newStage, reason }) => {
        try {
          await FunnelService.moveLeadToStage(prospectId, newStage as any, tenantId, reason);
          return { success: true, message: `Prospect movido a ${newStage}` };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Establecer temperatura del lead
   */
  static setLeadTemperatureTool(tenantId: string) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Actualiza la temperatura de un lead (FRIO, TIBIO, CALIENTE)',
      inputSchema: z.object({
        prospectId: z.string().optional().describe('ID del prospect'),
        lead_id: z.string().optional().describe('Alias de prospectId en snake_case'),
        temperature: z.enum(['FRIO', 'TIBIO', 'CALIENTE']).optional().describe('Nueva temperatura'),
        newTemperature: z.enum(['FRIO', 'TIBIO', 'CALIENTE']).optional().describe('Alias de temperature'),
      }),
      execute: async ({ prospectId, lead_id, temperature, newTemperature }) => {
        try {
          const normalizedProspectId = prospectId || lead_id;
          const normalizedTemperature = temperature || newTemperature;

          if (!normalizedProspectId || !normalizedTemperature) {
            return {
              success: false,
              error: 'prospectId/lead_id y temperature/newTemperature son requeridos',
            };
          }

          await prisma.prospect.update({
            where: { id: normalizedProspectId, tenantId },
            data: { temperature: normalizedTemperature as any },
          });
          return { success: true, message: `Temperatura actualizada a ${normalizedTemperature}` };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Enviar mensaje de WhatsApp
   */
  static sendWhatsAppMessageTool(tenantId: string) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Envía un mensaje de WhatsApp a un prospect',
      inputSchema: z.object({
        prospectId: z.string().describe('ID del prospect'),
        message: z.string().describe('Mensaje a enviar'),
      }),
      execute: async ({ prospectId, message }) => {
        try {
          const prospect = await prisma.prospect.findFirst({
            where: { id: prospectId, tenantId },
          });

          if (!prospect) {
            return { success: false, error: 'Prospect not found' };
          }

          await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId,
            tenantId,
          });

          return { success: true, message: 'WhatsApp enviado correctamente' };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Crear tarea de seguimiento
   */
  static createAgentTaskTool(tenantId: string, agentType: AgentType) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Crea una tarea de seguimiento en el Kanban',
      inputSchema: z.object({
        title: z.string().describe('Título de la tarea'),
        description: z.string().describe('Descripción detallada'),
        prospectId: z.string().optional().describe('ID del prospect relacionado'),
        priority: z.number().int().min(0).max(2).default(0).describe('Prioridad: 0=normal, 1=alta, 2=urgente'),
      }),
      execute: async ({ title, description, prospectId, priority }) => {
        try {
          const task = await AgentTaskService.createTask(
            {
              title,
              description,
              agentType,
              priority: priority || 0,
              prospectId,
            },
            tenantId
          );

          return { success: true, taskId: task.id, message: 'Tarea creada exitosamente' };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Guardar memoria/lección aprendida
   */
  static logMemoryTool(tenantId: string, agentType: AgentType) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Guarda una memoria, estrategia o lección aprendida para mejorar en el futuro',
      inputSchema: z.object({
        category: z.string().describe('Categoría: estrategia, leccion, patron_conversion, manejo_objeciones, etc.'),
        content: z.string().describe('Contenido de la memoria o lección'),
        score: z.number().int().min(0).max(100).default(50).describe('Score inicial (0-100)'),
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

          return { success: true, memoryId: memory.id, message: 'Memoria guardada' };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Disparar secuencia de email
   */
  static triggerEmailSequenceTool(tenantId: string) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Dispara una secuencia de emails automatizada para un prospect',
      inputSchema: z.object({
        prospectId: z.string().describe('ID del prospect'),
      }),
      execute: async ({ prospectId }) => {
        try {
          const prospect = await prisma.prospect.findFirst({
            where: { id: prospectId, tenantId },
          });

          if (!prospect) {
            return { success: false, error: 'Prospect not found' };
          }

          await EmailEngineService.triggerSequence(prospectId, prospect.funnelStage, tenantId);

          return { success: true, message: 'Secuencia de email disparada' };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Programar seguimiento
   */
  static scheduleFollowUpTool(tenantId: string) {
    // @ts-ignore - AI SDK v6 type inference limitation
    return tool({
      description: 'Programa una fecha de seguimiento para un prospect',
      inputSchema: z.object({
        prospectId: z.string().describe('ID del prospect'),
        daysFromNow: z.number().int().min(1).max(30).describe('Días desde hoy para el seguimiento'),
        notes: z.string().optional().describe('Notas sobre el seguimiento'),
      }),
      execute: async ({ prospectId, daysFromNow, notes }) => {
        try {
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + daysFromNow);

          await prisma.prospect.update({
            where: { id: prospectId, tenantId },
            data: { nextFollowUpAt: followUpDate },
          });

          if (notes) {
            await prisma.prospectInteraction.create({
              data: {
                type: 'NOTA',
                content: `Seguimiento programado para ${daysFromNow} días: ${notes}`,
                prospectId,
                tenantId,
              },
            });
          }

          return { success: true, followUpDate, message: `Seguimiento programado para ${followUpDate.toLocaleDateString()}` };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  }

  /**
   * Obtener todas las herramientas para Margy
   */
  static getMargyTools(tenantId: string) {
    return {
      getProspectInfo: this.getProspectInfoTool(tenantId),
      updateProspectStage: this.updateProspectStageTool(tenantId),
      setLeadTemperature: this.setLeadTemperatureTool(tenantId),
      sendWhatsAppMessage: this.sendWhatsAppMessageTool(tenantId),
      createAgentTask: this.createAgentTaskTool(tenantId, 'MARGY'),
      logMemory: this.logMemoryTool(tenantId, 'MARGY'),
      triggerEmailSequence: this.triggerEmailSequenceTool(tenantId),
      scheduleFollowUp: this.scheduleFollowUpTool(tenantId),
    };
  }

  /**
   * Obtener todas las herramientas para Kaled
   */
  static getKaledTools(tenantId: string) {
    return {
      getProspectInfo: this.getProspectInfoTool(tenantId),
      updateProspectStage: this.updateProspectStageTool(tenantId),
      setLeadTemperature: this.setLeadTemperatureTool(tenantId),
      createAgentTask: this.createAgentTaskTool(tenantId, 'KALED'),
      logMemory: this.logMemoryTool(tenantId, 'KALED'),
      scheduleFollowUp: this.scheduleFollowUpTool(tenantId),
    };
  }
}
