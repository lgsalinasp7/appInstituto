import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { CplAnalyticsService } from '@/modules/campaigns/services/cpl-analytics.service';
import { prisma } from '@/lib/prisma';

async function resolveTenantId(req: NextRequest, userId: string, userTenantId?: string | null) {
  if (userTenantId) return userTenantId;
  const tenantSlug = req.headers.get('x-tenant-slug');
  if (tenantSlug && tenantSlug !== 'admin') {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } });
    if (tenant) return tenant.id;
  }
  const platformUser = await prisma.user.findUnique({ where: { id: userId }, select: { platformRole: true } });
  if (!platformUser?.platformRole) return null;
  const fallbackTenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVO' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return fallbackTenant?.id ?? null;
}

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const tenantId = await resolveTenantId(req, user.id, user.tenantId);
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'No se pudo determinar el tenant' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    if (days < 1 || days > 90) {
      return NextResponse.json(
        { success: false, error: 'Los días deben estar entre 1 y 90' },
        { status: 400 }
      );
    }

    const data = await CplAnalyticsService.getStagnantLeads(tenantId, days);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching stagnant leads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener leads estancados' },
      { status: 500 }
    );
  }
});
