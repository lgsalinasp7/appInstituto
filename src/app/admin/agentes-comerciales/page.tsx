import { SalesAgentChat } from "@/modules/agents/components/SalesAgentChat";
import { AgentStats } from "@/components/agents/AgentStats";
import { AgentKanbanBoard } from "@/components/agents/AgentKanbanBoard";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

export default function AdminSalesAgentsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <DashboardHeader
        title="Agentes IA"
        titleHighlight="Comerciales"
        subtitle="Conversa con Margy y Kaled para optimizar tu proceso comercial"
      />

      <AgentStats />

      <SalesAgentChat />

      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold tracking-tighter text-white">
          Tareas de los Agentes
        </h2>
        <p className="text-sm font-medium text-slate-500">
          Los agentes generan y gestionan tareas automaticamente basadas en el analisis de leads
        </p>
        <AgentKanbanBoard />
      </div>
    </div>
  );
}
