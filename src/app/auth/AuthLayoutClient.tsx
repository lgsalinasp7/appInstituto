"use client";

import Image from "next/image";
import { GuestGuard } from "@/components/auth";
import { BrandingProvider } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface AuthLayoutClientProps {
  children: React.ReactNode;
  branding: {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    loginBgGradient: string | null;
    footerText: string | null;
    darkMode?: boolean;
    tenantName?: string;
    fontFamily?: string;
  };
  tenantName: string;
}

/**
 * Auth Layout Client
 * Layout inmersivo para páginas de autenticación con branding dinámico
 */
export default function AuthLayoutClient({
  children,
  branding,
  tenantName,
}: AuthLayoutClientProps) {
  const isDark = branding.darkMode !== false;

  // Extraer colores del gradiente o usar el primaryColor
  const gradientStyle = branding.loginBgGradient
    ? { backgroundImage: branding.loginBgGradient }
    : {
      backgroundImage: isDark
        ? `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 50%, ${branding.accentColor} 100%)`
        : `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)`,
    };

  const logoSrc = branding.logoUrl || "/logo-instituto.png";
  const footerText = branding.footerText || `© ${new Date().getFullYear()} ${tenantName}. Todos los derechos reservados.`;

  return (
    <GuestGuard>
      <BrandingProvider branding={branding}>
        <div
          className={cn(
            "min-h-screen relative overflow-hidden transition-colors duration-500",
            isDark ? "text-white" : "text-slate-900"
          )}
          style={gradientStyle}
        >
          {/* Patrón de fondo sutil */}
          <div className={cn(
            "absolute inset-0 transition-opacity duration-500",
            isDark ? "opacity-[0.03]" : "opacity-[0.05]"
          )} style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          {/* Logo gigante como watermark - centrado con efecto de luz */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[500px] h-[500px]">
              {/* Glow detrás del logo */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-3xl scale-75 transition-opacity duration-500",
                isDark ? "bg-white/[0.08]" : "bg-black/[0.02]"
              )} />
              <Image
                src={logoSrc}
                alt=""
                fill
                className={cn(
                  "object-contain transition-opacity duration-500",
                  isDark ? "opacity-[0.06]" : "opacity-[0.08]"
                )}
                priority
              />
            </div>
          </div>

          {/* Círculos decorativos animados */}
          <div className={cn(
            "absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl animate-pulse transition-opacity duration-500",
            isDark ? "bg-white/[0.02]" : "bg-black/[0.01]"
          )} />
          <div className={cn(
            "absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full blur-3xl transition-opacity duration-500",
            isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"
          )} />

          <div
            className="absolute top-[30%] left-[-5%] w-[200px] h-[200px] rounded-full blur-2xl"
            style={{ backgroundColor: isDark ? `${branding.accentColor}15` : `${branding.primaryColor}10` }}
          />

          {/* Líneas decorativas */}
          <div className={cn(
            "absolute top-0 left-0 w-full h-px",
            isDark ? "bg-gradient-to-r from-transparent via-white/10 to-transparent" : "bg-gradient-to-r from-transparent via-black/5 to-transparent"
          )} />
          <div className={cn(
            "absolute bottom-0 left-0 w-full h-px",
            isDark ? "bg-gradient-to-r from-transparent via-white/10 to-transparent" : "bg-gradient-to-r from-transparent via-black/5 to-transparent"
          )} />

          <div className="relative z-10 min-h-screen flex flex-col">
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
              <div className="w-full max-w-md">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={cn(
                    "w-[400px] h-[400px] rounded-full blur-3xl",
                    isDark ? "bg-white/[0.02]" : "bg-black/[0.01]"
                  )} />
                </div>

                <div className="relative animate-fade-in-up">
                  {children}
                </div>
              </div>
            </main>

            <footer className="p-6 text-center">
              <p className={cn(
                "text-sm",
                isDark ? "text-white/40" : "text-slate-400"
              )}>
                {footerText}
              </p>
            </footer>
          </div>
        </div>
      </BrandingProvider>
    </GuestGuard>
  );
}
