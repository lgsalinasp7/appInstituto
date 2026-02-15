import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Asegurar que no se cachee

export async function GET(req: NextRequest) {
    // 1. Validar autorización (CRON_SECRET)
    // Vercel envía este header automáticamente cuando ejecuta el cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const now = new Date();

        // 2. Buscar tenants vencidos que aún están activos
        const expiredTenants = await prisma.tenant.findMany({
            where: {
                subscriptionEndsAt: {
                    lt: now, // Menor que ahora (vencido)
                },
                status: {
                    not: 'SUSPENDIDO', // Que no estén ya suspendidos
                },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                subscriptionEndsAt: true,
            },
        });

        // 3. Suspender tenants vencidos
        const results = [];
        for (const tenant of expiredTenants) {
            // Actualizar estado a SUSPENDIDO
            await prisma.tenant.update({
                where: { id: tenant.id },
                data: {
                    status: 'SUSPENDIDO',
                },
            });

            // Registrar en el log (opcional, pero útil)
            console.log(`[CRON] Tenant suspendido por vencimiento: ${tenant.slug} (Venció: ${tenant.subscriptionEndsAt})`);

            results.push({
                tenant: tenant.slug,
                status: 'SUSPENDED',
                expiredAt: tenant.subscriptionEndsAt
            });
        }

        // 4. (Opcional) Buscar tenants por vencer para enviar alertas
        // Por ahora solo implementamos la suspensión.

        return NextResponse.json({
            success: true,
            processed: results.length,
            results,
        });

    } catch (error) {
        console.error('[CRON] Error procesando suscripciones:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
