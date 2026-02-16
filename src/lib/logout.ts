/**
 * Ejecuta logout completo: destruye sesión en servidor, limpia estado local y redirige.
 * La cookie httpOnly solo se puede borrar desde el servidor; sin esto el usuario
 * volvería al dashboard al ir a /auth/login (GuestGuard vería sesión válida).
 */

import { useAuthStore } from "@/lib/store/auth-store";

export async function performLogout(redirectPath?: string): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // Continuar aunque falle la petición (ej. offline)
  }
  useAuthStore.getState().logout();
  const path = redirectPath ?? (typeof window !== "undefined" && window.location.pathname.startsWith("/admin") ? "/login" : "/auth/login");
  window.location.href = path;
}
