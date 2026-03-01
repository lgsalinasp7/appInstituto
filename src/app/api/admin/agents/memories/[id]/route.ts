import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentMemoryService } from '@/modules/agents/services/agent-memory.service';
import { updateAgentMemorySchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';

export const PUT = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: any) => {
    try {
      const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));

      if (!context) {
        return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
      }

      const params = await context.params;
      const memoryId = params.id;
      const body = await request.json();
      const validated = updateAgentMemorySchema.parse(body);

      const memory = await AgentMemoryService.update(memoryId, validated, tenantId);

      return Response.json({
        success: true,
        data: memory,
        message: 'Memoria actualizada exitosamente',
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      console.error('Error updating agent memory:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: any) => {
    try {
      const tenantId = await resolveKaledTenantId(request.nextUrl.searchParams.get('tenantId'));

      if (!context) {
        return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
      }

      const params = await context.params;
      const memoryId = params.id;

      await prisma.agentMemory.delete({
        where: { id: memoryId, tenantId },
      });

      return Response.json({
        success: true,
        message: 'Memoria eliminada exitosamente',
      });
    } catch (error: any) {
      console.error('Error deleting agent memory:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
);
