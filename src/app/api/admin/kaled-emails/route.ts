import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const EMAIL_STATUSES = [
  'PENDING',
  'SCHEDULED',
  'SENT',
  'FAILED',
  'DELIVERED',
  'OPENED',
  'CLICKED',
  'BOUNCED',
] as const;

type EmailStatus = (typeof EMAIL_STATUSES)[number];

function isEmailStatus(value: string | null): value is EmailStatus {
  return Boolean(value && EMAIL_STATUSES.includes(value as EmailStatus));
}

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const search = searchParams.get('search')?.trim();
      const status = searchParams.get('status');
      const page = Math.max(1, Number(searchParams.get('page') || 1));
      const pageSizeRaw = Number(searchParams.get('pageSize') || 6);
      const pageSize = Math.min(100, Math.max(1, pageSizeRaw));
      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (isEmailStatus(status)) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { to: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          {
            kaledLead: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          { template: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.kaledEmailLog.findMany({
          where,
          include: {
            template: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
            kaledLead: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                utmCampaign: true,
                campaign: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { sentAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.kaledEmailLog.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          items,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
          },
        },
      });
    } catch (error: any) {
      console.error('Error getting kaled email logs:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener los correos',
        },
        { status: 500 }
      );
    }
  }
);
