import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const campaignCostRowSchema = z.object({
  date: z.coerce.date(),
  campaign: z.string().min(1, 'Campaign es requerido'),
  adset: z.string().optional().default('N/A'),
  ad: z.string().optional().default('N/A'),
  spendCop: z.number().positive('Gasto debe ser positivo'),
  impressions: z.number().int().nonnegative().optional(),
  clicks: z.number().int().nonnegative().optional(),
});

export type CampaignCostRow = z.infer<typeof campaignCostRowSchema>;

export class CsvParserService {
  static async parseCampaignCosts(csvContent: string): Promise<CampaignCostRow[]> {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((row: any, index: number) => {
      try {
        return campaignCostRowSchema.parse({
          date: row.date,
          campaign: row.campaign,
          adset: row.adset || 'N/A',
          ad: row.ad || 'N/A',
          spendCop: parseFloat(row.spend_cop.replace(/[^0-9.-]/g, '')),
          impressions: row.impressions ? parseInt(row.impressions) : undefined,
          clicks: row.clicks ? parseInt(row.clicks) : undefined,
        });
      } catch (error: any) {
        throw new Error(`Error en fila ${index + 2}: ${error.message}`);
      }
    });
  }
}
