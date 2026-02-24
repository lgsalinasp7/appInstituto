import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { CsvParserService } from '@/modules/campaigns/services/csv-parser.service';
import { CampaignCostRepository } from '@/modules/campaigns/repositories/campaign-cost.repository';
import { prisma } from '@/lib/prisma';

async function resolveTenantId(req: NextRequest, userId: string, userTenantId?: string | null) {
  if (userTenantId) return userTenantId;
  const tenantSlug = req.headers.get('x-tenant-slug');
  if (tenantSlug && tenantSlug !== 'admin') {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } });
    if (tenant) return tenant.id;
  }
  const platformUser = await prisma.user.findUnique({ where: { id: userId }, select: { platformRole: true } });
  if (!platformUser?.platformRole) return null;
  const fallbackTenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVO' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return fallbackTenant?.id ?? null;
}

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const tenantId = await resolveTenantId(req, user.id, user.tenantId);
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'No se pudo determinar el tenant' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Archivo CSV requerido' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Archivo demasiado grande (máximo 5MB)' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten archivos CSV' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const parsed = await CsvParserService.parseCampaignCosts(csvContent);

    if (parsed.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El archivo CSV está vacío' },
        { status: 400 }
      );
    }

    await CampaignCostRepository.bulkUpsert(parsed, tenantId);

    return NextResponse.json({
      success: true,
      data: { imported: parsed.length },
    });
  } catch (error: any) {
    console.error('Error importing campaign costs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al importar costos' },
      { status: 400 }
    );
  }
});
