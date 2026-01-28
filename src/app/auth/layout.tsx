"use client";

import Image from "next/image";
import { GuestGuard } from "@/components/auth";

/**
 * Auth Layout
 * Layout inmersivo para páginas de autenticación
 * Diseño premium con logo como marca de agua
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f2847] via-[#1e3a5f] to-[#2d4a6f]">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Logo gigante como watermark - centrado con efecto de luz */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[500px] h-[500px]">
          {/* Glow blanco detrás del logo para que se vea */}
          <div className="absolute inset-0 bg-white/[0.08] rounded-full blur-3xl scale-75" />
          <Image
            src="/logo-instituto.png"
            alt=""
            fill
            className="object-contain opacity-[0.06]"
            priority
          />
        </div>
      </div>

      {/* Círculos decorativos animados */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-3xl" />
      <div className="absolute top-[30%] left-[-5%] w-[200px] h-[200px] rounded-full bg-[#3b82f6]/[0.05] blur-2xl" />

      {/* Líneas decorativas */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
            </div>
            
            <div className="relative animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>

        <footer className="p-6 text-center">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Educamos con Valores
          </p>
          <p className="text-xs text-white/25 mt-1">
            Tu camino hacia el éxito educativo
          </p>
        </footer>
      </div>
    </div>
    </GuestGuard>
  );
}
