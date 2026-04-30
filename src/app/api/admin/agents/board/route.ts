import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';
import { PlatformRole } from '@prisma/client';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
    const ctx = logApiStart(req, 'admin_agents_board');
    const startedAt = Date.now();
    try {
      // Para agentes de plataforma, tenantId es null (campañas de la plataforma)
      const board = await AgentTaskService.getBoard(null);

      logApiSuccess(ctx, 'admin_agents_board', {
        duration: Date.now() - startedAt,
      });
      return Response.json({
        success: true,
        data: board,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_agents_board', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al obtener el board' },
        { status: 500 }
      );
    }
  }
);
