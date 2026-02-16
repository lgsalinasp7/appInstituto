"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

const AUTH_CHECK_TIMEOUT_MS = 3000;

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard - Protege rutas de autenticación (login/register)
 * Redirige a dashboard si el usuario ya está autenticado.
 * Excepción: /auth/change-password cuando mustChangePassword - permite acceso.
 * Verifica la sesión real en el servidor (/api/auth/me) en lugar de confiar
 * solo en el estado persistido de Zustand, evitando bucles de redirección.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setIsChecking(false);
    }, AUTH_CHECK_TIMEOUT_MS);

    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          signal: controller.signal,
        });

        // Solo redirigir si hay JSON válido con usuario (evita ciclos por redirects que devuelven HTML 200)
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            try {
              const data = await res.json();
              if (data?.id && data?.email) {
                clearTimeout(timeoutId);
                useAuthStore.getState().login({
                  ...data,
                  image: data.image ?? null,
                  invitationLimit: data.invitationLimit ?? 0,
                });
                // Permitir /auth/change-password cuando mustChangePassword
                if (pathname === "/auth/change-password" && data.mustChangePassword) {
                  setIsChecking(false);
                  return;
                }
                router.replace("/dashboard");
                return;
              }
            } catch {
              // JSON inválido - no redirigir
            }
          }
        }

        if (res.status === 401) {
          const state = useAuthStore.getState();
          if (state.isAuthenticated) {
            useAuthStore.getState().logout();
          }
          // /auth/change-password requiere sesión - redirigir a login
          if (pathname === "/auth/change-password") {
            clearTimeout(timeoutId);
            router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
            return;
          }
        }
      } catch {
        // Abort, network error, etc. - mostrar login
      } finally {
        clearTimeout(timeoutId);
        setIsChecking(false);
      }
    };

    let fallbackId: ReturnType<typeof setTimeout> | undefined;
    let hasRun = false;

    const runCheck = () => {
      if (hasRun) return;
      hasRun = true;
      if (fallbackId) {
        clearTimeout(fallbackId);
        fallbackId = undefined;
      }
      verifySession();
    };

    const persist = useAuthStore.persist;
    if (!persist || typeof persist.hasHydrated !== "function" || persist.hasHydrated()) {
      runCheck();
    } else {
      persist.onFinishHydration(runCheck);
      fallbackId = setTimeout(runCheck, 300);
    }

    return () => {
      clearTimeout(timeoutId);
      if (fallbackId) clearTimeout(fallbackId);
      controller.abort();
    };
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2847] via-[#1e3a5f] to-[#2d4a6f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-white/60">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}