import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { updateAgentTaskSchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { PlatformRole } from '@prisma/client';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
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

      return Response.json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      console.error('Error fetching agent task:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
);

export const PUT = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
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

      return Response.json({
        success: true,
        data: task,
        message: 'Tarea actualizada exitosamente',
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      console.error('Error updating agent task:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    try {
      if (!context) {
        return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
      }

      const params = await context.params;
      const taskId = params.id;

      // Para agentes de plataforma, tenantId es null
      await AgentTaskService.deleteTask(taskId, null);

      return Response.json({
        success: true,
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error: any) {
      console.error('Error deleting agent task:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
);
