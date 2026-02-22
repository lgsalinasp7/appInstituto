import { NextRequest } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { updateAgentTaskSchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';

export const GET = withTenantAuth(async (
  req: NextRequest,
  user,
  tenantId,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    if (!context) {
      return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
    }

    const params = await context.params;
    const taskId = params.id;

    const task = await AgentTaskService.getById(taskId, tenantId);

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
});

export const PUT = withTenantAuth(async (
  req: NextRequest,
  user,
  tenantId,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    if (!context) {
      return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
    }

    const params = await context.params;
    const taskId = params.id;
    const body = await req.json();
    const validated = updateAgentTaskSchema.parse(body);

    const task = await AgentTaskService.updateTask(taskId, validated, tenantId);

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
});

export const DELETE = withTenantAuth(async (
  req: NextRequest,
  user,
  tenantId,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    if (!context) {
      return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
    }

    const params = await context.params;
    const taskId = params.id;

    await AgentTaskService.deleteTask(taskId, tenantId);

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
});
