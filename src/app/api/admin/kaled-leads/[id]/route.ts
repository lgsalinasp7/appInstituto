/**
 * KaledLead Individual API Routes
 * GET /api/admin/kaled-leads/[id] - Get lead by ID
 * PUT /api/admin/kaled-leads/[id] - Update lead
 * DELETE /api/admin/kaled-leads/[id] - Soft delete lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';
import { KaledLeadService } from '@/modules/masterclass/services/kaled-lead.service';
import { z } from 'zod';

const updateLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
  observations: z.string().optional(),
  filteringData: z.record(z.string(), z.any()).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  campaignId: z.string().optional(),
});

// GET /api/admin/kaled-leads/[id]
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

      const lead = await KaledLeadService.getLeadById(id);

      if (!lead) {
        return NextResponse.json(
          {
            success: false,
            error: 'Lead no encontrado',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: lead,
      });
    } catch (error: any) {
      console.error('Error getting lead:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener el lead',
        },
        { status: 500 }
      );
    }
  }
);

// PUT /api/admin/kaled-leads/[id]
export const PUT = withPlatformAdmin(
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

      const body = await request.json();

      // Validar datos
      const validation = updateLeadSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      // Actualizar lead
      const lead = await KaledLeadService.updateLead(
        id,
        validation.data,
        user.id
      );

      return NextResponse.json({
        success: true,
        data: lead,
        message: 'Lead actualizado correctamente',
      });
    } catch (error: any) {
      console.error('Error updating lead:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al actualizar el lead',
        },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/kaled-leads/[id]
export const DELETE = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL'],
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

      // Soft delete lead
      await KaledLeadService.deleteLead(id, user.id);

      return NextResponse.json({
        success: true,
        message: 'Lead eliminado correctamente',
      });
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al eliminar el lead',
        },
        { status: 500 }
      );
    }
  }
);
