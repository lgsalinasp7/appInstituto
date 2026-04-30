import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { createAgentTaskSchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { PlatformRole } from '@prisma/client';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
    const ctx = logApiStart(req, 'admin_agents_tasks_list');
    const startedAt = Date.now();
    try {
      const { searchParams } = new URL(req.url);
      const agentType = searchParams.get('agentType') as 'MARGY' | 'KALED' | null;

      let tasks;
      if (agentType) {
        // Para agentes de plataforma, tenantId es null
        tasks = await AgentTaskService.getByAgent(agentType, null);
      } else {
        const board = await AgentTaskService.getBoard(null);
        tasks = board.columns.flatMap(col => col.tasks);
      }

      logApiSuccess(ctx, 'admin_agents_tasks_list', {
        duration: Date.now() - startedAt,
        recordCount: tasks.length,
      });
      return Response.json({
        success: true,
        data: tasks,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_agents_tasks_list', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al obtener tareas' },
        { status: 500 }
      );
    }
  }
);

export const POST = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
    const ctx = logApiStart(req, 'admin_agents_tasks_create');
    const startedAt = Date.now();
    try {
      const body = await req.json();
      const validated = createAgentTaskSchema.parse(body);

      // Para agentes de plataforma, tenantId es null
      const task = await AgentTaskService.createTask(validated, null);

      logApiSuccess(ctx, 'admin_agents_tasks_create', {
        duration: Date.now() - startedAt,
        resultId: task.id,
      });
      return Response.json({
        success: true,
        data: task,
        message: 'Tarea creada exitosamente',
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      logApiError(ctx, 'admin_agents_tasks_create', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al crear tarea' },
        { status: 500 }
      );
    }
  }
);
