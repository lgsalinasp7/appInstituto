import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isAfter } from "date-fns";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        // Aplicar rate limiting
        const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.RESET_PASSWORD, "reset-password");
        
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

        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { success: false, error: "Token y nueva contraseña son requeridos" },
                { status: 400 }
            );
        }

        const resetRequest = await prisma.passwordReset.findUnique({
            where: { token },
        });

        if (!resetRequest) {
            return NextResponse.json(
                { success: false, error: "El enlace es inválido o ha expirado" },
                { status: 400 }
            );
        }

        if (isAfter(new Date(), resetRequest.expiresAt)) {
            return NextResponse.json(
                { success: false, error: "El enlace ha expirado" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: resetRequest.email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { email: resetRequest.email },
            data: { password: hashedPassword, updatedAt: new Date() },
        });

        // Delete the reset token after use
        await prisma.passwordReset.delete({
            where: { token },
        });

        return NextResponse.json({
            success: true,
            message: "Tu contraseña ha sido restablecida exitosamente",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
