import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withCronAuth } from '@/lib/cron-auth';
import { logApiOperation } from '@/lib/api-logger';

export const dynamic = 'force-dynamic'; // Asegurar que no se cachee

/**
 * Cron: suspende tenants con subscriptionEndsAt vencido.
 * Auth: withCronAuth (Bearer ${CRON_SECRET}).
 */
export const GET = withCronAuth('cron.process-subscriptions', async (_req, ctx) => {
    const now = new Date();

    // Buscar tenants vencidos que aun estan activos
    const expiredTenants = await prisma.tenant.findMany({
        where: {
            subscriptionEndsAt: {
                lt: now,
            },
            status: {
                not: 'SUSPENDIDO',
            },
        },
        select: {
            id: true,
            name: true,
            slug: true,
            subscriptionEndsAt: true,
        },
    });

    // Suspender tenants vencidos
    const results = [];
    for (const tenant of expiredTenants) {
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                status: 'SUSPENDIDO',
            },
        });

        logApiOperation(ctx, 'cron.process-subscriptions', 'tenant suspendido por vencimiento', {
            tenantSlug: tenant.slug,
            expiredAt: tenant.subscriptionEndsAt,
        });

        results.push({
            tenant: tenant.slug,
            status: 'SUSPENDED',
            expiredAt: tenant.subscriptionEndsAt,
        });
    }

    return NextResponse.json({
        success: true,
        processed: results.length,
        results,
    });
});
