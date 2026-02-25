/**
 * KaledLead History API Route
 * GET /api/admin/kaled-leads/[id]/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledLeadService } from '@/modules/masterclass/services/kaled-lead.service';

export const GET = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (request: NextRequest, user, context: any) => {
    try {
      const params = await context.params;
      const id = params.id;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID del lead es requerido',
          },
          { status: 400 }
        );
      }

      // Obtener historial de interacciones
      const history = await KaledLeadService.getLeadHistory(id);

      return NextResponse.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Error getting lead history:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener el historial del lead',
        },
        { status: 500 }
      );
    }
  }
);
