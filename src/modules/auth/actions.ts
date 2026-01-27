"use server";

import { AuthService } from "./services/auth.service";
import { AuthUser } from "./types";
import { LoginFormData } from "./schemas";

export async function loginAction(data: LoginFormData): Promise<{ success: boolean; message?: string; user?: AuthUser }> {
    try {
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

        return { success: true, user: authUser };

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: "Error interno del servidor" };
    }
}
