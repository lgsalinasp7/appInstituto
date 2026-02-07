import type { Metadata } from "next";
import { Target, Users, PhoneCall, TrendingUp, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leads | Admin KaledSoft",
  description: "Pipeline comercial de la plataforma KaledSoft",
};

// Const types pattern (typescript skill)
const LEAD_STAGES = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  DEMO: "Demo",
  CONVERTIDO: "Convertido",
  PERDIDO: "Perdido",
} as const;

const STAGE_COLORS = {
  NUEVO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTADO: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  DEMO: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CONVERTIDO: "bg-green-500/10 text-green-400 border-green-500/20",
  PERDIDO: "bg-red-500/10 text-red-400 border-red-500/20",
} as const;

export default function LeadsPage() {
  const stages = Object.entries(LEAD_STAGES);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pipeline Comercial</h1>
          <p className="text-slate-400 mt-1">
            Gestiona leads y oportunidades de venta de la plataforma
          </p>
        </div>
      </div>

      {/* Stat Cards - Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Leads", value: "0", icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { title: "Nuevos Hoy", value: "0", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { title: "En Seguimiento", value: "0", icon: PhoneCall, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { title: "Convertidos (mes)", value: "0", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="glass-card rounded-[2rem] p-6 glass-card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban Stages */}
      <div className="glass-card rounded-[2rem] p-8">
        <h3 className="text-xl font-bold text-white mb-6">Etapas del Pipeline</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stages.map(([key, label]) => (
            <div
              key={key}
              className={cn(
                "rounded-2xl border p-4 text-center",
                STAGE_COLORS[key as keyof typeof STAGE_COLORS]
              )}
            >
              <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
              <div className="text-2xl font-bold mt-1">0</div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-6">
            <Rocket className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Módulo en Desarrollo</h3>
          <p className="text-slate-400 max-w-md mb-6">
            El sistema de leads de plataforma está siendo desarrollado. Pronto podrás gestionar
            oportunidades comerciales, hacer seguimiento de demos y convertir prospectos en clientes.
          </p>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-sm font-bold border border-cyan-500/20">
              CRM Pipeline
            </span>
            <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-bold border border-purple-500/20">
              Automatizaciones
            </span>
            <span className="px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-sm font-bold border border-green-500/20">
              Reportes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
