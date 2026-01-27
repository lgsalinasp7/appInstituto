import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { addHours } from "date-fns";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "El correo electrónico es requerido" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
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
