import { SalesAgentChat } from "@/modules/agents/components/SalesAgentChat";
import { AgentStats } from "@/components/agents/AgentStats";
import { AgentKanbanBoard } from "@/components/agents/AgentKanbanBoard";

export default function AdminSalesAgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agentes IA Comerciales</h1>
        <p className="text-slate-400 mt-1">
          Conversa con Margy y Kaled para optimizar tu proceso comercial
        </p>
      </div>

      <AgentStats />

      <SalesAgentChat />

      <div>
        <h2 className="text-2xl font-bold mb-4">Tareas de los Agentes</h2>
        <p className="text-sm text-slate-400 mb-4">
          Los agentes generan y gestionan tareas automaticamente basadas en el analisis de leads
        </p>
        <AgentKanbanBoard />
      </div>
    </div>
  );
}
