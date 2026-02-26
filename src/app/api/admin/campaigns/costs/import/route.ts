import { NextRequest, NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/api-auth';

export const POST = withPlatformAdmin(
  ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
  async (_req: NextRequest) =>
    NextResponse.json(
      {
        success: false,
        error:
          'La importación de costos basada en tenant fue deshabilitada para evitar mezcla entre tenants y campañas KaledSoft.',
        code: 'TENANT_COST_IMPORT_DISABLED',
      },
      { status: 410 }
    )
);
