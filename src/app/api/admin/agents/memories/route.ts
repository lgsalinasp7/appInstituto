import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentMemoryService } from '@/modules/agents/services/agent-memory.service';
import { createAgentMemorySchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { PlatformRole } from '@prisma/client';

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (req: NextRequest, user) => {
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

      return Response.json({
        success: true,
        data: memories,
      });
    } catch (error: any) {
      console.error('Error fetching agent memories:', error);
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
      const validated = createAgentMemorySchema.parse(body);

      // Para agentes de plataforma, tenantId es null
      const memory = await AgentMemoryService.create(validated, null);

      return Response.json({
        success: true,
        data: memory,
        message: 'Memoria creada exitosamente',
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      console.error('Error creating agent memory:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
);
