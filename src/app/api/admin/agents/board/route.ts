import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { PlatformRole } from '@prisma/client';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
    try {
      // Para agentes de plataforma, tenantId es null (campañas de la plataforma)
      const board = await AgentTaskService.getBoard(null);

      return Response.json({
        success: true,
        data: board,
      });
    } catch (error: any) {
      console.error('Error fetching agent board:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
);
