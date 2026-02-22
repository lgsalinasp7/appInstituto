import { NextRequest, NextResponse } from 'next/server';
import { EmailEngineService } from '@/modules/email-sequences';

/**
 * Cron job para procesar emails pendientes
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

        // Procesar emails pendientes
        const result = await EmailEngineService.processScheduledEmails();

        return NextResponse.json({
            success: true,
            data: result,
            message: `Processed ${result.sent} emails successfully, ${result.failed} failed`,
        });
    } catch (error: any) {
        console.error('Error processing email sequences:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
