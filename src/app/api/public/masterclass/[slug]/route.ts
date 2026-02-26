import { NextResponse } from 'next/server';

const TENANT_LEADS_DISABLED_MESSAGE =
  'El registro y consulta pública de masterclass para tenants está deshabilitado por política de separación.';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: TENANT_LEADS_DISABLED_MESSAGE,
      code: 'TENANT_LEADS_DISABLED',
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: TENANT_LEADS_DISABLED_MESSAGE,
      code: 'TENANT_LEADS_DISABLED',
    },
    { status: 410 }
  );
}
