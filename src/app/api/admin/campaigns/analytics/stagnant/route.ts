import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    if (days < 1 || days > 90) {
      return NextResponse.json(
        { success: false, error: 'Los días deben estar entre 1 y 90' },
        { status: 400 }
      );
    }

    const cutoffDate = subDays(new Date(), days);
    const leads = await prisma.kaledLead.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ['CONVERTIDO', 'PERDIDO'] },
        updatedAt: { lt: cutoffDate },
      },
      include: {
        campaign: { select: { name: true } },
        interactions: {
          where: { type: 'CAMBIO_ESTADO' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { updatedAt: 'asc' },
      take: 50,
    });

    const data = leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone || '',
      funnelStage: lead.status,
      temperature: lead.interestLevel?.toUpperCase() || 'N/A',
      advisor: null,
      program: lead.campaign?.name || null,
      daysSinceUpdate: Math.floor((Date.now() - lead.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
      lastStageChange: lead.interactions[0]?.createdAt || lead.updatedAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching stagnant leads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener leads estancados' },
      { status: 500 }
    );
  }
}
);
