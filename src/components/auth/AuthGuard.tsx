"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Protege rutas que requieren autenticación
 * Verifica sesión con /api/auth/me (fuente de verdad) para evitar ciclos
 * cuando Zustand está desincronizado (ej. subdominio diferente, redirects).
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (cancelled) return;

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            try {
              const data = await res.json();
              if (data?.id && data?.email) {
                useAuthStore.getState().login({
                  ...data,
                  image: data.image ?? null,
                  invitationLimit: data.invitationLimit ?? 0,
                });
                // Si debe cambiar contraseña, redirigir a /auth/change-password
                if (data.mustChangePassword && pathname !== "/auth/change-password") {
                  router.replace("/auth/change-password");
                  return;
                }
                setIsChecking(false);
                return;
              }
            } catch {
              // JSON inválido
            }
          }
        }

        // 401 o respuesta no válida → redirigir a login
        useAuthStore.getState().logout();
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/auth/login?returnUrl=${returnUrl}`);
      } catch {
        if (!cancelled) {
          const state = useAuthStore.getState();
          if (state.isAuthenticated) {
            setIsChecking(false);
            return;
          }
          const returnUrl = encodeURIComponent(pathname);
          router.replace(`/auth/login?returnUrl=${returnUrl}`);
        }
      }
    };

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  // Mostrar loading mientras verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0f2847] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748b]">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
