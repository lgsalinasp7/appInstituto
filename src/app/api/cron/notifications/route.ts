import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WhatsAppService } from "@/modules/whatsapp/services/whatsapp.service";
import { generatePaymentReminderMessage } from "@/modules/dashboard/utils/whatsapp";
import { addDays, startOfDay } from "date-fns";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

/**
 * Cron Job: Payment Notifications
 * Protección: Requiere header Authorization: Bearer ${CRON_SECRET}
 * Este endpoint NO usa autenticación de usuario, sino validación por token secreto.
 *
 * Aislamiento multi-tenant: itera tenants activos y ejecuta queries scoped por tenantId.
 */
export async function GET(request: NextRequest) {
    const ctx = logApiStart(request, "cron.notifications");

    // CRITICAL: Validar CRON_SECRET siempre
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET) {
        logApiError(ctx, "cron.notifications", {
            error: new Error("CRON_SECRET no está configurado"),
        });
        return NextResponse.json(
            { success: false, error: "Servicio no configurado" },
            { status: 503 }
        );
    }

    if (authHeader !== expectedAuth) {
        logApiError(ctx, "cron.notifications", {
            error: new Error("Intento de acceso no autorizado al cron"),
        });
        return NextResponse.json(
            { success: false, error: "No autorizado" },
            { status: 401 }
        );
    }

    const startedAt = Date.now();

    try {
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

                    // If already sent for this tier, skip
                    if (notifications[tier.key]) continue;

                    // Generate message
                    const message = generatePaymentReminderMessage({
                        studentName: commitment.student.fullName,
                        amount: Number(commitment.amount),
                        dueDate: commitment.scheduledDate.toISOString(),
                    });

                    // Send WhatsApp
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

        logApiSuccess(ctx, "cron.notifications", {
            duration: Date.now() - startedAt,
            recordCount: results.length,
            metadata: { tenantsProcessed: activeTenants.length },
        });

        return NextResponse.json({
            success: true,
            processed: results.length,
            tenantsProcessed: activeTenants.length,
            details: results,
        });
    } catch (error) {
        logApiError(ctx, "cron.notifications", { error });
        return NextResponse.json(
            { success: false, error: "Error interno en el cron" },
            { status: 500 }
        );
    }
}
