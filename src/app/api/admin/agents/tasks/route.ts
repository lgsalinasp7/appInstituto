import { NextRequest } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { createAgentTaskSchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';

export const GET = withTenantAuth(async (req: NextRequest, user, tenantId) => {
  try {
    const { searchParams } = new URL(req.url);
    const agentType = searchParams.get('agentType') as 'MARGY' | 'KALED' | null;

    let tasks;
    if (agentType) {
      tasks = await AgentTaskService.getByAgent(agentType, tenantId);
    } else {
      const board = await AgentTaskService.getBoard(tenantId);
      tasks = board.columns.flatMap(col => col.tasks);
    }

    return Response.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error('Error fetching agent tasks:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const POST = withTenantAuth(async (req: NextRequest, user, tenantId) => {
  try {
    const body = await req.json();
    const validated = createAgentTaskSchema.parse(body);

    const task = await AgentTaskService.createTask(validated, tenantId);

    return Response.json({
      success: true,
      data: task,
      message: 'Tarea creada exitosamente',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating agent task:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
