"use server";

import { AuthService } from "./services/auth.service";
import { AuthUser } from "./types";
import { LoginFormData } from "./schemas";
import { createSession } from "@/lib/auth";
import { checkRateLimitByEmail, resetRateLimitByEmail, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function loginAction(data: LoginFormData): Promise<{ success: boolean; message?: string; user?: AuthUser }> {
    try {
        // Aplicar rate limiting por email
        const rateLimit = checkRateLimitByEmail(data.email, RATE_LIMIT_CONFIGS.LOGIN, "login");
        
        if (!rateLimit.allowed) {
            const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
            return { 
                success: false, 
                message: `Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en ${resetIn} segundos.` 
            };
        }

        const user = await AuthService.findUserByEmail(data.email);

        if (!user) {
            return { success: false, message: "Usuario no encontrado" };
        }

        // Verify password using bcrypt
        if (!user.password) {
            return { success: false, message: "Cuenta sin contraseña configurada" };
        }

        const isValidPassword = await AuthService.verifyPassword(data.password, user.password);

        if (!isValidPassword) {
            return { success: false, message: "Contraseña incorrecta" };
        }

        if (!user.isActive) {
            return { success: false, message: "Cuenta inactiva" };
        }

        const authUser = AuthService.mapToAuthUser(user);

        if (!authUser) {
            return { success: false, message: "Error al procesar usuario" };
        }

        // Crear sesión server-side con cookie httpOnly
        await createSession(user.id);

        // Reiniciar el rate limit después de un login exitoso
        resetRateLimitByEmail(data.email, "login");

        return { success: true, user: authUser };

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: "Error interno del servidor" };
    }
}

export async function logoutAction(): Promise<{ success: boolean }> {
    try {
        const { destroySession } = await import("@/lib/auth");
        await destroySession();
        return { success: true };
    } catch (error) {
        console.error("Logout Error:", error);
        return { success: false };
    }
}
