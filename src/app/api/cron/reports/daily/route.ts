import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TelegramBotService } from '@/modules/telegram/services/telegram-bot.service';
import { ReportGeneratorService } from '@/modules/telegram/services/report-generator.service';

export async function GET(req: NextRequest) {
  // Verificar cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVO' },
      select: { id: true, name: true },
    });

    const results = [];

    for (const tenant of tenants) {
      try {
        const chatId = await TelegramBotService.getTenantChatId(tenant.id);
        if (!chatId) {
          results.push({
            tenant: tenant.name,
            status: 'skipped',
            reason: 'No chat ID configured',
          });
          continue;
        }

        const report = await ReportGeneratorService.generateDailyReport(tenant.id);
        await TelegramBotService.sendMessage(chatId, report);

        results.push({
          tenant: tenant.name,
          status: 'sent',
          chatId,
        });
      } catch (error: any) {
        console.error(`Error sending daily report for ${tenant.name}:`, error);
        results.push({
          tenant: tenant.name,
          status: 'error',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error('Error sending daily reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
