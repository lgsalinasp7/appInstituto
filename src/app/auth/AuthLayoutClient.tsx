"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GuestGuard } from "@/components/auth";
import { BrandingProvider } from "@/components/providers/BrandingContext";
import { HeroRobot } from "@/components/marketing/v2/HeroRobot";
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
  allowRegister?: boolean;
}

/**
 * Auth Layout Client
 * Layout inmersivo para páginas de autenticación con branding dinámico
 */
export default function AuthLayoutClient({
  children,
  branding,
  tenantName,
  allowRegister = true,
}: AuthLayoutClientProps) {
  const pathname = usePathname();
  const isDark = branding.darkMode !== false;
  const isLoginPage = pathname === "/auth/login" || pathname?.endsWith("/login");
  const showRegisterLink = allowRegister && isLoginPage;

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

  // Layout tipo split para login (izquierda decorativa, derecha formulario)
  const isSplitLoginLayout = isLoginPage && isDark;

  return (
    <GuestGuard>
      <BrandingProvider branding={branding}>
        <div
          className={cn(
            "min-h-screen relative overflow-hidden transition-colors duration-500",
            isDark ? "text-white" : "text-slate-900"
          )}
          style={isSplitLoginLayout ? undefined : gradientStyle}
        >
          {isSplitLoginLayout ? (
            /* Split layout para login */
            <div className="min-h-screen flex flex-col lg:flex-row">
              {/* Panel izquierdo - decorativo */}
              <div
                className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center"
                style={{
                  background: "radial-gradient(circle at 30% 50%, #1e1b4b 0%, #0f172a 100%)",
                }}

              >
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                <div className="absolute -top-28 -left-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-[120px]" />
                <div className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

                <div className="relative z-10 w-full px-10 xl:px-16">
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1] font-display">
                        KaledSoft
                        <br />
                        <span className="text-slate-500">Academia & Lab</span>
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                        Entrena, construye y escala productos SaaS con agentes de IA en una sola plataforma.
                      </p>
                    </div>

                    <div className="max-w-[420px]">
                      <HeroRobot />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel derecho - formulario */}
              <div
                className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 min-h-screen relative"
                style={{
                  background: "radial-gradient(circle at 70% 50%, #1e293b 0%, #0f172a 100%)",
                }}

              >
                {/* Logo arriba a la izquierda - Global */}
                <div className="fixed top-6 left-6 z-[100] flex items-center gap-2">
                  {branding.logoUrl ? (
                    <div className="relative w-32 h-10">
                      <Image src={branding.logoUrl} alt={tenantName} fill className="object-contain object-left" />
                    </div>
                  ) : (
                    <span className="text-xl font-black text-white tracking-[0.2em]">LOGO</span>
                  )}
                </div>

                <div className="w-full max-w-md mt-10 lg:mt-0">
                  <div className="relative animate-fade-in-up">
                    {children}
                  </div>
                </div>
                <footer className="mt-8 text-center">
                  {showRegisterLink && (
                    <p className="text-sm text-white/60 mb-2">
                      ¿No tienes cuenta?{" "}
                      <Link
                        href="/auth/register"
                        className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Regístrate
                      </Link>
                    </p>
                  )}
                  <p className="text-sm text-white/40">{footerText}</p>
                </footer>
              </div>
            </div>
          ) : (
            /* Layout original para register, forgot-password, etc */
            <>
              <div
                className="absolute inset-0"
                style={gradientStyle}
              />
              <div className={cn(
                "absolute inset-0 transition-opacity duration-500",
                isDark ? "opacity-[0.03]" : "opacity-[0.05]"
              )} style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[500px] h-[500px]">
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

                <footer className="p-6 text-center space-y-3">
                  {showRegisterLink && (
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-white/60" : "text-slate-600"
                    )}>
                      ¿No tienes cuenta?{" "}
                      <Link
                        href="/auth/register"
                        className={cn(
                          "font-semibold underline underline-offset-2 hover:no-underline transition-all",
                          isDark ? "text-cyan-400 hover:text-cyan-300" : "text-blue-600 hover:text-blue-700"
                        )}
                      >
                        Regístrate
                      </Link>
                    </p>
                  )}
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-white/40" : "text-slate-400"
                  )}>
                    {footerText}
                  </p>
                </footer>
              </div>
            </>
          )}
        </div>
      </BrandingProvider>
    </GuestGuard>
  );
}
