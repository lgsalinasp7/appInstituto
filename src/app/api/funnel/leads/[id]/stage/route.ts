import { NextResponse } from 'next/server';
import { withTenantAuthAndCSRF } from '@/lib/api-auth';

const TENANT_LEADS_DISABLED_MESSAGE =
  'El módulo de leads/funnel para tenants está deshabilitado por política de separación.';

export const PATCH = withTenantAuthAndCSRF(async () =>
  NextResponse.json(
    {
      success: false,
      error: TENANT_LEADS_DISABLED_MESSAGE,
      code: 'TENANT_LEADS_DISABLED',
    },
    { status: 410 }
  )
);
