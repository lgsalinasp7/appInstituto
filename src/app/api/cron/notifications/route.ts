import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WhatsAppService } from "@/modules/whatsapp/services/whatsapp.service";
import { generatePaymentReminderMessage } from "@/modules/dashboard/utils/whatsapp";
import { addDays, isSameDay, startOfDay } from "date-fns";

/**
 * Cron Job: Payment Notifications
 * Protección: Requiere header Authorization: Bearer ${CRON_SECRET}
 * Este endpoint NO usa autenticación de usuario, sino validación por token secreto.
 */
export async function GET(request: NextRequest) {
    // CRITICAL: Validar CRON_SECRET siempre
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
        console.error("[CRON] CRON_SECRET no está configurado. Rechazando por seguridad.");
        return NextResponse.json(
            { success: false, error: "Servicio no configurado" },
            { status: 503 }
        );
    }

    if (authHeader !== expectedAuth) {
        console.error("[CRON] Intento de acceso no autorizado");
        return NextResponse.json(
            { success: false, error: "No autorizado" },
            { status: 401 }
        );
    }

    try {
        const today = startOfDay(new Date());

        // Frequencies: 7 days before, 3 days before, 1 day before
        const tiers = [
            { days: 7, key: "7d" },
            { days: 3, key: "3d" },
            { days: 1, key: "1d" },
        ];

        const results = [];

        for (const tier of tiers) {
            const targetDate = addDays(today, tier.days);
            const nextDay = addDays(targetDate, 1);

            // Find commitments for this target date tier
            const commitments = await prisma.paymentCommitment.findMany({
                where: {
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
                const notifications = (commitment.notificationsSent as any) || {};

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
                    // Update tracking
                    await prisma.paymentCommitment.update({
                        where: { id: commitment.id },
                        data: {
                            notificationsSent: {
                                ...notifications,
                                [tier.key]: true,
                                lastSent: new Date().toISOString(),
                            },
                        },
                    });
                    results.push({ student: commitment.student.fullName, tier: tier.key });
                }
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results,
        });
    } catch (error) {
        console.error("Cron Notifications Error:", error);
        return NextResponse.json(
            { success: false, error: "Error interno en el cron" },
            { status: 500 }
        );
    }
}
