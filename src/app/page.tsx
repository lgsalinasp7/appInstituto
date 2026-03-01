import Link from "next/link";
import { headers } from "next/headers";
import { InstitutionalWrapper } from "@/components/marketing/v2/InstitutionalWrapper";
import { HeroRobot } from "@/components/marketing/v2/HeroRobot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://kaledsoft.tech'
  }
};

function TenantWelcome() {
  return (
    <main className="relative min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden">
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]">
                La IA no es opcional. Es el estándar.
              </span>

              <div className="space-y-5">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1] font-display">
                  KaledSoft
                  <br />
                  <span className="text-slate-500">Academia & Lab</span>
                </h1>
                <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Plataforma de formación y tecnología para crear productos SaaS con agentes de IA y ejecución real.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(8,145,178,0.3)] text-center"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/formacion"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all text-center"
                >
                  Ver la Academia
                </Link>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <HeroRobot />
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
      </section>

      <footer className="relative z-10 py-6 text-center text-sm text-slate-500 border-t border-white/5">
        © {new Date().getFullYear()} KaledSoft Academia & Lab. Todos los derechos reservados.
      </footer>
    </main>
  );
}

export default async function HomePage() {
  const headerList = await headers();
  const tenantSlug = headerList.get("x-tenant-slug");

  // Si hay un slug de tenant (establecido por el proxy), mostrar la App del Tenant
  if (tenantSlug) {
    const { prisma } = await import("@/lib/prisma");
    const { getCurrentUser } = await import("@/lib/auth");
    const { redirect } = await import("next/navigation");

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { status: true }
    });

    // Tenant no encontrado (slug inválido o eliminado) -> mostrar landing
    if (!tenant) {
      return <InstitutionalWrapper />;
    }

    if (tenant.status === "SUSPENDIDO" || tenant.status === "CANCELADO") {
      redirect("/suspended");
    }

    // Usuario autenticado: redirigir a dashboard (academy users serán redirigidos a /academia desde allí)
    const user = await getCurrentUser();
    if (user) {
      redirect("/dashboard");
    }

    return <TenantWelcome />;
  }

  // Otherwise, render the KaledSoft Institutional Home
  return <InstitutionalWrapper />;
}
