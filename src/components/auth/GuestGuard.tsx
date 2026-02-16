"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

const AUTH_CHECK_TIMEOUT_MS = 3000;

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard - Protege rutas de autenticación (login/register)
 * Redirige a dashboard si el usuario ya está autenticado.
 * Verifica la sesión real en el servidor (/api/auth/me) en lugar de confiar
 * solo en el estado persistido de Zustand, evitando bucles de redirección.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
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

        if (res.ok) {
          clearTimeout(timeoutId);
          router.replace("/dashboard");
          return;
        }

        if (res.status === 401) {
          const state = useAuthStore.getState();
          if (state.isAuthenticated) {
            useAuthStore.getState().logout();
          }
        }
      } catch {
        // Abort, network error, etc. - mostrar login
      } finally {
        clearTimeout(timeoutId);
        setIsChecking(false);
      }
    };

    const runCheck = () => {
      verifySession();
    };

    const persist = useAuthStore.persist;
    if (!persist || persist.hasHydrated()) {
      runCheck();
    } else {
      persist.onFinishHydration(runCheck);
    }

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [router]);

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
