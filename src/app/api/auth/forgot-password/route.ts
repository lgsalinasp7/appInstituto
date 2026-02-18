import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { addHours } from "date-fns";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimitByEmail, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "El correo electrónico es requerido" },
                { status: 400 }
            );
        }

        // Aplicar rate limiting por email
        const rateLimit = checkRateLimitByEmail(email, RATE_LIMIT_CONFIGS.RESET_PASSWORD, "forgot-password");
        
        if (!rateLimit.allowed) {
            const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Demasiados intentos. Por favor, intente nuevamente en ${resetIn} segundos.` 
                },
                { 
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": RATE_LIMIT_CONFIGS.RESET_PASSWORD.maxRequests.toString(),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
                        "Retry-After": Math.ceil(resetIn).toString(),
                    }
                }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: { select: { slug: true } } },
        });

        // For security reasons, we use a generic response if the user doesn't exist
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
            });
        }

        const token = randomUUID();
        const expiresAt = addHours(new Date(), 1);

        await prisma.passwordReset.create({
            data: {
                email,
                token,
                expiresAt,
            },
        });

        await sendPasswordResetEmail({
            to: email,
            token,
            userName: user.name || undefined,
            tenantSlug: user.tenant?.slug || undefined,
        });

        return NextResponse.json({
            success: true,
            message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
