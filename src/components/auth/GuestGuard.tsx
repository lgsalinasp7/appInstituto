"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard - Protege rutas de autenticación (login/register)
 * Redirige a dashboard si el usuario ya está autenticado
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Verificar después de que el componente se monte y Zustand hidrate
    const checkAuth = () => {
      const state = useAuthStore.getState();

      if (state.isAuthenticated) {
        router.replace("/dashboard");
      } else {
        setIsChecking(false);
      }
    };

    // Delay para permitir hidratación de Zustand persist
    const timeout = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeout);
  }, [isMounted, router]);

  // Mostrar loading mientras verifica
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
