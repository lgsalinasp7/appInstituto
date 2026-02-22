/**
 * Landing Page de Masterclass Dinámica
 * Server Component que renderiza landing según el slug
 */

import { notFound } from 'next/navigation';
import { MasterclassService } from '@/modules/masterclass';
import { getTenantIdFromServerRequest } from '@/lib/tenant-utils';
import { LeadCaptureForm } from '@/components/landing/LeadCaptureForm';
import { MasterclassCountdown } from '@/components/landing/MasterclassCountdown';
import { MetaPixel } from '@/components/landing/MetaPixel';
import { Sparkles, Clock, Users, Award } from 'lucide-react';

export default async function MasterclassLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  // Obtener tenantId del subdominio
  const tenantId = await getTenantIdFromServerRequest();
  if (!tenantId) {
    notFound();
  }

  const { slug } = await params;

  // Obtener masterclass por slug
  const masterclass = await MasterclassService.getBySlug(slug, tenantId);

  if (!masterclass) {
    notFound();
  }

  const benefits = [
    {
      icon: Sparkles,
      title: 'Contenido Exclusivo',
      description: 'Aprende estrategias que no encontrarás en ningún otro lugar',
    },
    {
      icon: Clock,
      title: 'Sesión en Vivo',
      description: 'Interactúa directamente y resuelve tus dudas en tiempo real',
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Conecta con personas que comparten tus mismos objetivos',
    },
    {
      icon: Award,
      title: '100% Gratis',
      description: 'Sin costo, sin letra pequeña, solo valor puro',
    },
  ];

  return (
    <>
      <MetaPixel />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-cyan-400 font-semibold">🎯 Masterclass Gratuita</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {masterclass.title}
            </h1>

            {masterclass.description && (
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
                {masterclass.description}
              </p>
            )}

            <div className="mb-12">
              <MasterclassCountdown scheduledAt={masterclass.scheduledAt} />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-16 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              ¿Qué aprenderás?
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-lg mb-4">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-white/70">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
                Reserva tu cupo GRATIS
              </h2>
              <p className="text-white/70 text-center mb-8">
                Los cupos son limitados. Regístrate ahora para asegurar tu lugar.
              </p>

              <LeadCaptureForm
                masterclassSlug={slug}
                ctaText="Quiero mi cupo gratis"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-8 border-t border-white/10">
          <p className="text-center text-white/50 text-sm">
            © {new Date().getFullYear()} KaledSoft. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </>
  );
}
