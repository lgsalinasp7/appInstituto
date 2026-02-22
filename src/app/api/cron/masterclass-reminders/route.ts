import { NextRequest, NextResponse } from 'next/server';
import { AutomationService } from '@/modules/funnel/services/automation.service';

/**
 * Cron job para enviar recordatorios de masterclass
 * Configurar en Vercel Cron para ejecutar cada hora
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar que la petición viene de Vercel Cron
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Procesar recordatorios de masterclass
        const result = await AutomationService.processMasterclassReminders();

        return NextResponse.json({
            success: true,
            data: result,
            message: `Sent ${result.sent24h} reminders (24h) and ${result.sent1h} reminders (1h)`,
        });
    } catch (error: any) {
        console.error('Error processing masterclass reminders:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
