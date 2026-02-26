/**
 * API Pública: Captura de Leads
 * POST /api/public/leads - Capturar lead desde landing page
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'La captura pública de leads para tenants está deshabilitada por política de separación.',
      code: 'TENANT_LEADS_DISABLED',
    },
    { status: 410 }
  );
}
