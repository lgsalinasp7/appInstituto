"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Protege rutas que requieren autenticación
 * Reemplaza la funcionalidad del middleware para rutas protegidas
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
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

      if (!state.isAuthenticated) {
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/auth/login?returnUrl=${returnUrl}`);
      } else {
        setIsChecking(false);
      }
    };

    // Delay para permitir hidratación de Zustand persist
    const timeout = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeout);
  }, [isMounted, pathname, router]);

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
