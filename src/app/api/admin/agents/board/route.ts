import { NextRequest } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { AgentTaskService } from '@/modules/agents/services/agent-task.service';

export const GET = withTenantAuth(async (req: NextRequest, user, tenantId) => {
  try {
    const board = await AgentTaskService.getBoard(tenantId);

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
});
