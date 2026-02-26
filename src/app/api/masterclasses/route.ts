import { NextResponse } from 'next/server';
import { withTenantAuth, withTenantAuthAndCSRF } from '@/lib/api-auth';

const TENANT_LEADS_DISABLED_MESSAGE =
  'El módulo de masterclass/leads para tenants está deshabilitado por política de separación.';

export const GET = withTenantAuth(async () =>
  NextResponse.json(
    {
      success: false,
      error: TENANT_LEADS_DISABLED_MESSAGE,
      code: 'TENANT_LEADS_DISABLED',
    },
    { status: 410 }
  )
);

export const POST = withTenantAuthAndCSRF(async () =>
  NextResponse.json(
    {
      success: false,
      error: TENANT_LEADS_DISABLED_MESSAGE,
      code: 'TENANT_LEADS_DISABLED',
    },
    { status: 410 }
  )
);
