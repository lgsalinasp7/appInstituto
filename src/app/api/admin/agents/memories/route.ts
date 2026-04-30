import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentMemoryService } from '@/modules/agents/services/agent-memory.service';
import { createAgentMemorySchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { PlatformRole } from '@prisma/client';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
    const ctx = logApiStart(req, 'admin_agents_memories_list');
    const startedAt = Date.now();
    try {
      const { searchParams } = new URL(req.url);
      const agentType = searchParams.get('agentType') as 'MARGY' | 'KALED' | null;
      const category = searchParams.get('category');

      if (!agentType) {
        return Response.json(
          { success: false, error: 'agentType is required' },
          { status: 400 }
        );
      }

      let memories;
      if (category) {
        // Para agentes de plataforma, tenantId es null
        memories = await AgentMemoryService.getByCategory(agentType, category, null);
      } else {
        memories = await AgentMemoryService.getByAgent(agentType, null);
      }

      logApiSuccess(ctx, 'admin_agents_memories_list', {
        duration: Date.now() - startedAt,
        recordCount: memories.length,
      });
      return Response.json({
        success: true,
        data: memories,
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_agents_memories_list', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al obtener memorias' },
        { status: 500 }
      );
    }
  }
);

export const POST = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
    const ctx = logApiStart(req, 'admin_agents_memories_create');
    const startedAt = Date.now();
    try {
      const body = await req.json();
      const validated = createAgentMemorySchema.parse(body);

      // Para agentes de plataforma, tenantId es null
      const memory = await AgentMemoryService.create(validated, null);

      logApiSuccess(ctx, 'admin_agents_memories_create', {
        duration: Date.now() - startedAt,
        resultId: memory.id,
      });
      return Response.json({
        success: true,
        data: memory,
        message: 'Memoria creada exitosamente',
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      logApiError(ctx, 'admin_agents_memories_create', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al crear memoria' },
        { status: 500 }
      );
    }
  }
);
