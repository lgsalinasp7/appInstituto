import { NextResponse } from 'next/server';

/**
 * Cron job para procesar emails pendientes
 * Configurar en Vercel Cron para ejecutar cada hora
 */
export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: 'El cron de secuencias de email tenant está deshabilitado por política de separación.',
            code: 'TENANT_LEADS_DISABLED',
        },
        { status: 410 }
    );
}
