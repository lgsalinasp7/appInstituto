import { prisma } from '@/lib/prisma';
import type { AgentTask, AgentTaskStatus, AgentType } from '@prisma/client';
import type { AgentTaskBoard, AgentTaskColumn, AgentTaskItem, AgentStats } from '../types';
import { AGENT_TASK_STATUS_LABELS } from '../types';
import { startOfDay, endOfDay } from 'date-fns';

export class AgentTaskService {
  /**
   * Obtener tablero Kanban completo
   * @param tenantId - ID del tenant o null para tareas de plataforma
   */
  static async getBoard(tenantId: string | null): Promise<AgentTaskBoard> {
    const tasks = await prisma.agentTask.findMany({
      where: tenantId ? { tenantId } : { tenantId: null },
      include: {
        prospect: {
          select: { name: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Agrupar por status
    const statuses: AgentTaskStatus[] = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'MEJORA'];
    const columns: AgentTaskColumn[] = statuses.map(status => ({
      status,
      label: AGENT_TASK_STATUS_LABELS[status],
      tasks: tasks
        .filter(t => t.status === status)
        .map(t => this.mapToTaskItem(t)),
    }));

    // Calcular stats
    const stats = await this.calculateStats(tenantId);

    return { columns, stats };
  }

  /**
   * Crear tarea de agente
   * @param tenantId - ID del tenant o null para tareas de plataforma
   */
  static async createTask(
    data: {
      title: string;
      description: string;
      agentType: AgentType;
      priority?: number;
      prospectId?: string;
      metadata?: Record<string, unknown>;
    },
    tenantId: string | null
  ): Promise<AgentTask> {
    return prisma.agentTask.create({
      data: {
        title: data.title,
        description: data.description,
        agentType: data.agentType,
        priority: data.priority,
        prospectId: data.prospectId,
        metadata: (data.metadata as any) || undefined,
        tenantId: tenantId || undefined,
      },
    });
  }

  /**
   * Actualizar tarea
   */
  static async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: AgentTaskStatus;
      priority?: number;
      result?: string;
      metadata?: Record<string, unknown>;
    },
    tenantId: string | null
  ): Promise<AgentTask> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.result !== undefined) updateData.result = data.result;
    if (data.metadata !== undefined) updateData.metadata = data.metadata as any;

    // Si cambia a COMPLETADA, guardar completedAt
    if (data.status === 'COMPLETADA') {
      updateData.completedAt = new Date();
    }

    return prisma.agentTask.update({
      where: {
        id: taskId,
        ...(tenantId ? { tenantId } : { tenantId: null })
      },
      data: updateData,
    });
  }

  /**
   * Eliminar tarea
   */
  static async deleteTask(taskId: string, tenantId: string | null): Promise<void> {
    await prisma.agentTask.delete({
      where: {
        id: taskId,
        ...(tenantId ? { tenantId } : { tenantId: null })
      },
    });
  }

  /**
   * Obtener tarea por ID
   */
  static async getById(taskId: string, tenantId: string | null): Promise<AgentTask | null> {
    return prisma.agentTask.findFirst({
      where: {
        id: taskId,
        ...(tenantId ? { tenantId } : { tenantId: null })
      },
      include: {
        prospect: true,
      },
    });
  }

  /**
   * Obtener tareas por agente
   */
  static async getByAgent(agentType: AgentType, tenantId: string | null): Promise<AgentTask[]> {
    return prisma.agentTask.findMany({
      where: {
        agentType,
        ...(tenantId ? { tenantId } : { tenantId: null })
      },
      include: {
        prospect: {
          select: { name: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Obtener tareas pendientes de un prospect
   */
  static async getPendingByProspect(prospectId: string, tenantId: string | null): Promise<AgentTask[]> {
    return prisma.agentTask.findMany({
      where: {
        prospectId,
        ...(tenantId ? { tenantId } : { tenantId: null }),
        status: { in: ['PENDIENTE', 'EN_PROCESO'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calcular estadísticas de agentes
   */
  private static async calculateStats(tenantId: string | null): Promise<AgentStats> {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const tenantFilter = tenantId ? { tenantId } : { tenantId: null };

    // Stats de Margy
    const margyTasks = await prisma.agentTask.findMany({
      where: { agentType: 'MARGY', ...tenantFilter },
    });

    const margyCompletedToday = await prisma.agentTask.count({
      where: {
        agentType: 'MARGY',
        ...tenantFilter,
        status: 'COMPLETADA',
        completedAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const margyPending = margyTasks.filter(t => t.status === 'PENDIENTE' || t.status === 'EN_PROCESO').length;

    // Stats de Kaled
    const kaledTasks = await prisma.agentTask.findMany({
      where: { agentType: 'KALED', ...tenantFilter },
    });

    const kaledCompletedToday = await prisma.agentTask.count({
      where: {
        agentType: 'KALED',
        ...tenantFilter,
        status: 'COMPLETADA',
        completedAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const kaledPending = kaledTasks.filter(t => t.status === 'PENDIENTE' || t.status === 'EN_PROCESO').length;

    return {
      margy: {
        totalTasks: margyTasks.length,
        completedToday: margyCompletedToday,
        pendingTasks: margyPending,
        avgCompletionTime: this.calculateAvgCompletionTime(margyTasks),
        successRate: this.calculateSuccessRate(margyTasks),
        specificMetrics: {
          leadsQualified: await this.countLeadsQualifiedByMargy(tenantId),
          messagesSent: await this.countMessagesSentByMargy(tenantId),
        },
      },
      kaled: {
        totalTasks: kaledTasks.length,
        completedToday: kaledCompletedToday,
        pendingTasks: kaledPending,
        avgCompletionTime: this.calculateAvgCompletionTime(kaledTasks),
        successRate: this.calculateSuccessRate(kaledTasks),
        specificMetrics: {
          briefingsGenerated: kaledTasks.filter(t => t.title.includes('Briefing')).length,
          analyticsRun: kaledTasks.filter(t => t.title.includes('Analytics')).length,
        },
      },
    };
  }

  /**
   * Helpers
   */
  private static mapToTaskItem(task: AgentTask & { prospect: { name: string } | null }): AgentTaskItem {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      agentType: task.agentType,
      priority: task.priority,
      prospectName: task.prospect?.name || null,
      prospectId: task.prospectId,
      result: task.result,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      metadata: (task.metadata as Record<string, unknown>) || undefined,
    };
  }

  private static calculateAvgCompletionTime(tasks: AgentTask[]): number {
    const completed = tasks.filter(t => t.status === 'COMPLETADA' && t.completedAt);
    if (completed.length === 0) return 0;

    const totalMinutes = completed.reduce((sum, task) => {
      if (!task.completedAt) return sum;
      const diff = task.completedAt.getTime() - task.createdAt.getTime();
      return sum + diff / 1000 / 60; // minutos
    }, 0);

    return Math.round(totalMinutes / completed.length);
  }

  private static calculateSuccessRate(tasks: AgentTask[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'COMPLETADA').length;
    return Math.round((completed / tasks.length) * 100);
  }

  private static async countLeadsQualifiedByMargy(tenantId: string | null): Promise<number> {
    // Contar prospects que fueron movidos de NUEVO a INTERESADO o superior
    // (simplificado - en producción usar interacciones)
    // Para plataforma (tenantId=null), contar todos los prospects
    const where: any = {
      funnelStage: { notIn: ['NUEVO', 'PERDIDO'] },
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    return prisma.prospect.count({ where });
  }

  private static async countMessagesSentByMargy(tenantId: string | null): Promise<number> {
    const where: any = {
      direction: 'OUTBOUND',
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    return prisma.whatsAppMessage.count({ where });
  }
}
