/**
 * KaledLeads API Routes
 * GET /api/admin/kaled-leads - List all leads with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledLeadService } from '@/modules/masterclass/services/kaled-lead.service';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;

      const search = searchParams.get('search') || undefined;
      const status = searchParams.get('status') || undefined;
      const campaignId = searchParams.get('campaignId') || undefined;
      const includeDeleted = searchParams.get('includeDeleted') === 'true';
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const result = await KaledLeadService.searchLeads({
        search,
        status,
        campaignId,
        includeDeleted,
        limit,
        offset,
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error getting leads:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener los leads',
        },
        { status: 500 }
      );
    }
  }
);
