import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WhatsAppService } from "@/modules/whatsapp/services/whatsapp.service";
import { generatePaymentReminderMessage } from "@/modules/dashboard/utils/whatsapp";
import { addDays, startOfDay } from "date-fns";
import { withCronAuth } from "@/lib/cron-auth";
import { logApiOperation } from "@/lib/api-logger";

/**
 * Cron Job: Payment Notifications
 * Proteccion: Requiere header Authorization: Bearer ${CRON_SECRET} via withCronAuth.
 *
 * Aislamiento multi-tenant: itera tenants activos y ejecuta queries scoped por tenantId.
 */
export const GET = withCronAuth("cron.notifications", async (_request, ctx) => {
    const today = startOfDay(new Date());

    // Frequencies: 7 days before, 3 days before, 1 day before
    const tiers = [
        { days: 7, key: "7d" },
        { days: 3, key: "3d" },
        { days: 1, key: "1d" },
    ];

    // Iterar tenants activos para mantener aislamiento multi-tenant en cada query
    const activeTenants = await prisma.tenant.findMany({
        where: { status: "ACTIVO" },
        select: { id: true, slug: true },
    });

    const results: { tenantId: string; student: string; tier: string }[] = [];

    for (const tenant of activeTenants) {
        const tenantId = tenant.id;

        for (const tier of tiers) {
            const targetDate = addDays(today, tier.days);
            const nextDay = addDays(targetDate, 1);

            // Find commitments for this target date tier (scoped por tenantId)
            const commitments = await prisma.paymentCommitment.findMany({
                where: {
                    tenantId,
                    status: "PENDIENTE",
                    scheduledDate: {
                        gte: targetDate,
                        lt: nextDay,
                    },
                },
                include: {
                    student: {
                        select: {
                            fullName: true,
                            phone: true,
                        },
                    },
                },
            });

            for (const commitment of commitments) {
                const notifications =
                    (commitment.notificationsSent as Record<string, boolean | string>) || {};

                if (notifications[tier.key]) continue;

                const message = generatePaymentReminderMessage({
                    studentName: commitment.student.fullName,
                    amount: Number(commitment.amount),
                    dueDate: commitment.scheduledDate.toISOString(),
                });

                const success = await WhatsAppService.sendMessage({
                    to: commitment.student.phone,
                    message,
                });

                if (success) {
                    // Defense-in-depth: updateMany con tenantId filter (no hay unique compuesto)
                    await prisma.paymentCommitment.updateMany({
                        where: { id: commitment.id, tenantId },
                        data: {
                            notificationsSent: {
                                ...notifications,
                                [tier.key]: true,
                                lastSent: new Date().toISOString(),
                            },
                        },
                    });
                    results.push({
                        tenantId,
                        student: commitment.student.fullName,
                        tier: tier.key,
                    });
                }
            }
        }
    }

    logApiOperation(ctx, "cron.notifications", "procesamiento de notificaciones completado", {
        tenantsProcessed: activeTenants.length,
        notificationsSent: results.length,
    });

    return NextResponse.json({
        success: true,
        processed: results.length,
        tenantsProcessed: activeTenants.length,
        details: results,
    });
});
