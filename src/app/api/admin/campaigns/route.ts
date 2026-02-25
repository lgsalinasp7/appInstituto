/**
 * Campaigns API Routes
 * GET /api/admin/campaigns - List all campaigns
 * POST /api/admin/campaigns - Create new campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledCampaignService } from '@/modules/kaled-crm/services/kaled-campaign.service';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeline: z.any().optional(),
});

// GET /api/admin/campaigns
export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest) => {
    try {
      const campaigns = await KaledCampaignService.getAllCampaigns();

      return NextResponse.json({
        success: true,
        data: campaigns,
      });
    } catch (error: any) {
      console.error('Error getting campaigns:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener las campañas',
        },
        { status: 500 }
      );
    }
  }
);

// POST /api/admin/campaigns
export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'MARKETING'],
  async (request: NextRequest) => {
    try {
      const body = await request.json();

      // Validar datos
      const validation = createCampaignSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const data = validation.data;

      const campaign = await KaledCampaignService.createCampaign({
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        timeline: data.timeline,
      });

      return NextResponse.json({
        success: true,
        data: campaign,
        message: 'Campaña creada correctamente',
      });
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al crear la campaña',
        },
        { status: 500 }
      );
    }
  }
);
