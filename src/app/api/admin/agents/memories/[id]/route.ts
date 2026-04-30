import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { AgentMemoryService } from '@/modules/agents/services/agent-memory.service';
import { updateAgentMemorySchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';
import { logApiStart, logApiSuccess, logApiError } from '@/lib/api-logger';

export const PUT = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_agents_memories_update');
    const startedAt = Date.now();
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

      logApiSuccess(ctx, 'admin_agents_memories_update', {
        duration: Date.now() - startedAt,
        resultId: memoryId,
      });
      return Response.json({
        success: true,
        data: memory,
        message: 'Memoria actualizada exitosamente',
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      logApiError(ctx, 'admin_agents_memories_update', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al actualizar memoria' },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withPlatformAdmin(
  ['SUPER_ADMIN'],
  async (request: NextRequest, user, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = logApiStart(request, 'admin_agents_memories_delete');
    const startedAt = Date.now();
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

      logApiSuccess(ctx, 'admin_agents_memories_delete', {
        duration: Date.now() - startedAt,
        resultId: memoryId,
      });
      return Response.json({
        success: true,
        message: 'Memoria eliminada exitosamente',
      });
    } catch (error: unknown) {
      logApiError(ctx, 'admin_agents_memories_delete', { error });
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : 'Error al eliminar memoria' },
        { status: 500 }
      );
    }
  }
);
