import type { Metadata } from "next";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { AiAgentService } from "@/modules/chat/services/ai-agent.service";
import { AgentKPICards } from "./AgentKPICards";
import { FreeTierUsageCard } from "./FreeTierUsageCard";
import { TokenTrendsChart } from "./TokenTrendsChart";
import { ModelDistributionChart } from "./ModelDistributionChart";
import { TopTenantsTable } from "./TopTenantsTable";
import { RecentUsageTable } from "./RecentUsageTable";

export const metadata: Metadata = {
  title: "Agentes IA | Admin KaledSoft",
  description: "Monitoreo de consumo y costos de modelos de IA",
};

export const dynamic = "force-dynamic";

export default async function AgentesPage() {
  // Fetch initial stats on server side
  const stats = await AiAgentService.getAgentStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Agentes"
        titleHighlight="IA"
        subtitle="Monitoreo de consumo y costos de modelos de inteligencia artificial"
      />

      {/* Alerta de Cambio Temporal a Groq */}
      <div className="glass-card rounded-[2rem] p-6 border-2 border-yellow-500/30 bg-yellow-500/5 animate-fade-in-up">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">
              Modelo Temporal: Groq (Llama 3.3 70B Versatile)
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              Se cambió temporalmente de <strong>Google Gemini</strong> a{" "}
              <strong className="text-yellow-400">Groq</strong> debido a problemas de cuota con la
              API key de Google. El sistema está funcionando normalmente.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-yellow-500/20">
              <div>
                <p className="text-xs text-slate-400">Modelo Actual</p>
                <p className="text-sm font-semibold text-yellow-400">Llama 3.3 70B</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Free Tier</p>
                <p className="text-sm font-semibold text-green-400">15M tokens/día</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Equivalente Mensual</p>
                <p className="text-sm font-semibold text-cyan-400">450M tokens/mes</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Estado</p>
                <p className="text-sm font-semibold text-green-400">✅ Activo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <AgentKPICards stats={stats} />

      {/* Free Tier Progress Bar */}
      <FreeTierUsageCard usage={stats.freeTierUsage} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <TokenTrendsChart />
        <ModelDistributionChart />
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopTenantsTable />
        <RecentUsageTable />
      </div>
    </div>
  );
}
