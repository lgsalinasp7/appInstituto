import { prisma } from '@/lib/prisma';
import { CampaignCostRow } from '../services/csv-parser.service';

export class CampaignCostRepository {
  static async bulkUpsert(data: CampaignCostRow[], tenantId: string) {
    return prisma.$transaction(
      data.map(cost =>
        prisma.campaignCost.upsert({
          where: {
            tenantId_date_campaign_adset_ad: {
              tenantId,
              date: cost.date,
              campaign: cost.campaign,
              adset: cost.adset || 'N/A',
              ad: cost.ad || 'N/A',
            },
          },
          create: {
            ...cost,
            tenantId,
            adset: cost.adset || 'N/A',
            ad: cost.ad || 'N/A',
          },
          update: {
            spendCop: cost.spendCop,
            impressions: cost.impressions,
            clicks: cost.clicks,
          },
        })
      )
    );
  }

  static async getCampaignSummary(tenantId: string, startDate?: Date, endDate?: Date) {
    return prisma.campaignCost.groupBy({
      by: ['campaign'],
      where: {
        tenantId,
        ...(startDate && { date: { gte: startDate } }),
        ...(endDate && { date: { lte: endDate } }),
      },
      _sum: { spendCop: true, impressions: true, clicks: true },
      _count: true,
    });
  }
}
