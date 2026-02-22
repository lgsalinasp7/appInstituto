'use client';

import { Calendar, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MasterclassSectionProps {
  title: string;
  subtitle: string;
  duration: string;
  onRegisterClick: () => void;
}

export function MasterclassSection({
  title,
  subtitle,
  duration,
  onRegisterClick,
}: MasterclassSectionProps) {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#1e3a5f] to-[#0f2847] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Video className="h-4 w-4" />
            <span className="text-sm font-medium">Evento Online Gratuito</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4 font-display">
            {title}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm text-white/70">Próximamente</div>
                <div className="font-bold">Por definir</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm text-white/70">Duración</div>
                <div className="font-bold">{duration}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Video className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm text-white/70">Modalidad</div>
                <div className="font-bold">100% Online</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-3">En esta masterclass aprenderás:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Las 3 herramientas de IA que todo desarrollador debe dominar en 2026</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Cómo construir tu primer proyecto Full Stack con IA en tiempo récord</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>El roadmap exacto para conseguir trabajo remoto en menos de 12 meses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Errores que cometen el 90% de los que aprenden a programar (y cómo evitarlos)</span>
              </li>
            </ul>
          </div>

          <Button
            size="lg"
            onClick={onRegisterClick}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-lg py-6 rounded-xl font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
          >
            Quiero reservar mi cupo gratis
          </Button>

          <p className="text-center text-sm text-white/60 mt-4">
            Cupos limitados • Sin costo • Sin tarjeta de crédito
          </p>
        </div>
      </div>
    </section>
  );
}
