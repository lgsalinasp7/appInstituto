import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { createAgentTaskSchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { PlatformRole } from '@prisma/client';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
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
  }
);

export const POST = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
    try {
      const body = await req.json();
      const validated = createAgentTaskSchema.parse(body);

      // Para agentes de plataforma, tenantId es null
      const task = await AgentTaskService.createTask(validated, null);

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
  }
);
