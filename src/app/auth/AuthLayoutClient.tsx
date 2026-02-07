"use client";

import Image from "next/image";
import { GuestGuard } from "@/components/auth";

interface AuthLayoutClientProps {
  children: React.ReactNode;
  branding: {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    loginBgGradient: string | null;
    footerText: string | null;
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
  // Extraer colores del gradiente o usar el primaryColor
  const gradientStyle = branding.loginBgGradient 
    ? { backgroundImage: branding.loginBgGradient }
    : {
        backgroundImage: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 50%, ${branding.accentColor} 100%)`,
      };

  const logoSrc = branding.logoUrl || "/logo-instituto.png";
  const footerText = branding.footerText || `© ${new Date().getFullYear()} ${tenantName}. Todos los derechos reservados.`;

  return (
    <GuestGuard>
      <div 
        className="min-h-screen relative overflow-hidden"
        style={gradientStyle}
      >
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
              src={logoSrc}
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
        <div 
          className="absolute top-[30%] left-[-5%] w-[200px] h-[200px] rounded-full blur-2xl"
          style={{ backgroundColor: `${branding.accentColor}15` }}
        />

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
              {footerText}
            </p>
            {/* Subtítulo dinámico - se puede personalizar por tenant en el futuro */}
          </footer>
        </div>
      </div>
    </GuestGuard>
  );
}
