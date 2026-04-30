import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { updateAgentTaskSchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { PlatformRole } from '@prisma/client';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(req, 'admin_agents_tasks_get');
    const startedAt = Date.now();
    try {
      if (!context) {
        return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
      }

      const params = await context.params;
      const taskId = params.id;

      // Para agentes de plataforma, tenantId es null
      const task = await AgentTaskService.getById(taskId, null);

      if (!task) {
        return Response.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }

      logApiSuccess(ctx, 'admin_agents_tasks_get', {
        duration: Date.now() - startedAt,
        resultId: taskId,
      });
      return Response.json({
        success: true,
        data: task,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_agents_tasks_get', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al obtener tarea' },
        { status: 500 }
      );
    }
  }
);

export const PUT = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(req, 'admin_agents_tasks_update');
    const startedAt = Date.now();
    try {
      if (!context) {
        return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
      }

      const params = await context.params;
      const taskId = params.id;
      const body = await req.json();
      const validated = updateAgentTaskSchema.parse(body);

      // Para agentes de plataforma, tenantId es null
      const task = await AgentTaskService.updateTask(taskId, validated, null);

      logApiSuccess(ctx, 'admin_agents_tasks_update', {
        duration: Date.now() - startedAt,
        resultId: taskId,
      });
      return Response.json({
        success: true,
        data: task,
        message: 'Tarea actualizada exitosamente',
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      logApiError(ctx, 'admin_agents_tasks_update', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al actualizar tarea' },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(req, 'admin_agents_tasks_delete');
    const startedAt = Date.now();
    try {
      if (!context) {
        return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
      }

      const params = await context.params;
      const taskId = params.id;

      // Para agentes de plataforma, tenantId es null
      await AgentTaskService.deleteTask(taskId, null);

      logApiSuccess(ctx, 'admin_agents_tasks_delete', {
        duration: Date.now() - startedAt,
        resultId: taskId,
      });
      return Response.json({
        success: true,
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_agents_tasks_delete', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al eliminar tarea' },
        { status: 500 }
      );
    }
  }
);
