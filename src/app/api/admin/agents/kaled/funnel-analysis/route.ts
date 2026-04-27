import { NextRequest } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (req: NextRequest) => {
  try {
    // Tenant isolation: filtrar por tenantId resuelto (query param o tenant base 'kaledsoft')
    const tenantId = await resolveKaledTenantId(req.nextUrl.searchParams.get('tenantId'));

    const [statusBuckets, campaignBuckets] = await Promise.all([
      prisma.kaledLead.groupBy({
        by: ['status'],
        where: { deletedAt: null, tenantId },
        _count: true,
      }),
      prisma.kaledCampaign.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          status: true,
          _count: {
            select: {
              leads: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const byStatus = statusBuckets.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    const analysis = {
      totals: {
        totalLeads: statusBuckets.reduce((acc, item) => acc + item._count, 0),
        newLeads: byStatus.NUEVO || 0,
        contactedLeads: byStatus.CONTACTADO || 0,
        demoLeads: byStatus.DEMO || 0,
        convertedLeads: byStatus.CONVERTIDO || 0,
        lostLeads: byStatus.PERDIDO || 0,
      },
      campaigns: campaignBuckets.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        leads: campaign._count.leads,
      })),
      generatedAt: new Date().toISOString(),
    };

    return Response.json({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    console.error('Error analyzing funnel:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al analizar funnel' },
      { status: 500 }
    );
  }
}
);
