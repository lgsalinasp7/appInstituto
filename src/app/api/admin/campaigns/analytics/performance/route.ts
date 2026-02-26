import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const period = parseInt(searchParams.get('period') || '30');

    if (period < 1 || period > 365) {
      return NextResponse.json(
        { success: false, error: 'El período debe estar entre 1 y 365 días' },
        { status: 400 }
      );
    }

    const startDate = subDays(new Date(), period);
    const campaigns = await prisma.kaledCampaign.findMany({
      include: {
        leads: {
          where: {
            deletedAt: null,
            createdAt: { gte: startDate },
          },
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = campaigns.map((campaign) => {
      const totalLeads = campaign.leads.length;
      const matriculados = campaign.leads.filter((lead) => lead.status === 'CONVERTIDO').length;
      const perdidos = campaign.leads.filter((lead) => lead.status === 'PERDIDO').length;
      const spend = 0;
      const cpl = totalLeads > 0 ? spend / totalLeads : 0;
      const conversionRate = totalLeads > 0 ? (matriculados / totalLeads) * 100 : 0;
      const cps = matriculados > 0 ? spend / matriculados : 0;

      return {
        campaign: campaign.name,
        spend,
        totalLeads,
        matriculados,
        perdidos,
        cpl,
        conversionRate,
        cps,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching campaign performance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener rendimiento' },
      { status: 500 }
    );
  }
}
);
