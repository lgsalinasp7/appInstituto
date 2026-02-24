import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { AgentMemoryService } from '@/modules/agents/services/agent-memory.service';
import { updateAgentMemorySchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';

async function resolveTenantId(req: NextRequest, userId: string, userTenantId?: string | null) {
  if (userTenantId) return userTenantId;

  const tenantSlug = req.headers.get('x-tenant-slug');
  if (tenantSlug && tenantSlug !== 'admin') {
    const tenantFromSlug = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });
    if (tenantFromSlug) return tenantFromSlug.id;
  }

  const userWithPlatformRole = await prisma.user.findUnique({
    where: { id: userId },
    select: { platformRole: true },
  });

  if (!userWithPlatformRole?.platformRole) return null;

  const defaultTenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVO' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return defaultTenant?.id ?? null;
}

export const PUT = withAuth(async (
  req: NextRequest,
  user,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    const tenantId = await resolveTenantId(req, user.id, user.tenantId);
    if (!tenantId) {
      return Response.json(
        { success: false, error: 'No se pudo determinar el tenant' },
        { status: 401 }
      );
    }

    if (!context) {
      return Response.json({ success: false, error: 'Invalid context' }, { status: 500 });
    }

    const params = await context.params;
    const memoryId = params.id;
    const body = await req.json();
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
});

export const DELETE = withAuth(async (
  req: NextRequest,
  user,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    const tenantId = await resolveTenantId(req, user.id, user.tenantId);
    if (!tenantId) {
      return Response.json(
        { success: false, error: 'No se pudo determinar el tenant' },
        { status: 401 }
      );
    }

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
});
