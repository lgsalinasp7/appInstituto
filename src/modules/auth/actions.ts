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

        // TODO: Implement real password hashing comparison
        // For now, we compare against the seeded "hashed_password_here" or simple plaintext for dev convenience if needed.
        // In seed: password is "hashed_password_here"
        // Ideally user inputs "password" and we verify hash.
        // For this prototype, if matches DB string exactly OR is "123456" (dev backdoor) we allow.

        // Simple check for the seeded password
        if (user.password !== data.password && data.password !== "123456") {
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
