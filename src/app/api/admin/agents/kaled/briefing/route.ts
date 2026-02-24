import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { KaledService } from '@/modules/agents/services/kaled.service';
import { generateBriefingSchema } from '@/modules/agents/schemas';
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

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const tenantId = await resolveTenantId(req, user.id, user.tenantId);
    if (!tenantId) {
      return Response.json(
        { success: false, error: 'No se pudo determinar el tenant' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = generateBriefingSchema.parse(body);

    const briefing = await KaledService.generateBriefing(
      validated.prospectId,
      tenantId,
      {
        includeTimeline: validated.includeTimeline,
        includeAnalytics: validated.includeAnalytics,
      }
    );

    return Response.json({
      success: true,
      data: briefing,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error generating briefing:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
