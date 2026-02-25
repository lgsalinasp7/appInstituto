/**
 * KaledLead Restore API Route
 * POST /api/admin/kaled-leads/[id]/restore
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledLeadService } from '@/modules/masterclass/services/kaled-lead.service';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN'],
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

      // Restaurar lead
      const lead = await KaledLeadService.restoreLead(id);

      return NextResponse.json({
        success: true,
        data: lead,
        message: 'Lead restaurado correctamente',
      });
    } catch (error: any) {
      console.error('Error restoring lead:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al restaurar el lead',
        },
        { status: 500 }
      );
    }
  }
);
