import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { TelegramBotService } from '@/modules/telegram/services/telegram-bot.service';
import { ReportGeneratorService } from '@/modules/telegram/services/report-generator.service';
import { prisma } from '@/lib/prisma';

async function resolveTenantId(req: NextRequest, userId: string, userTenantId?: string | null) {
  if (userTenantId) return userTenantId;

  const tenantSlug = req.headers.get('x-tenant-slug');
  if (tenantSlug && tenantSlug !== 'admin') {
    const tenantFromSlug = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });
    if (tenantFromSlug) return tenantFromSlug.id;
  }

  const userWithPlatformRole = await prisma.user.findUnique({
    where: { id: userId },
    select: { platformRole: true },
  });

  if (!userWithPlatformRole?.platformRole) return null;

  const defaultTenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVO' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return defaultTenant?.id ?? null;
}

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const tenantId = await resolveTenantId(req, user.id, user.tenantId);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'No se pudo determinar el tenant' },
        { status: 401 }
      );
    }

    const chatId = await TelegramBotService.getTenantChatId(tenantId);

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'No hay Chat ID configurado para este tenant' },
        { status: 400 }
      );
    }

    // Generar y enviar reporte de prueba
    const report = await ReportGeneratorService.generateDailyReport(tenantId);
    const testMessage = `🧪 *REPORTE DE PRUEBA*\n\n${report}\n\n✅ Configuración correcta. Recibirás reportes automáticos diarios a las 09:00 AM.`;

    await TelegramBotService.sendMessage(chatId, testMessage);

    return NextResponse.json({
      success: true,
      message: 'Reporte de prueba enviado exitosamente',
    });
  } catch (error: any) {
    console.error('Error sending test report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al enviar reporte de prueba',
      },
      { status: 500 }
    );
  }
});
