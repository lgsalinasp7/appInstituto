"use client";

import { cn } from "@/lib/utils";
import { Bot, MessageSquare, DollarSign, Cpu } from "lucide-react";
import type { AgentStats } from "@/modules/chat/types/agent.types";

interface AgentKPICardsProps {
  stats: AgentStats;
}

export function AgentKPICards({ stats }: AgentKPICardsProps) {
  const kpis = [
    {
      title: "Total Tokens",
      value: stats.totalTokens.toLocaleString("es-CO"),
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      trend: stats.trends.tokensTrend,
    },
    {
      title: "Mensajes IA",
      value: stats.totalMessages.toLocaleString("es-CO"),
      icon: MessageSquare,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      trend: stats.trends.messagesTrend,
    },
    {
      title: "Costo Total",
      value: `$${stats.totalCostCOP.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} COP`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
      trend: stats.trends.costTrend,
    },
    {
      title: "Modelos Activos",
      value: stats.activeModels.toString(),
      icon: Bot,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      trend: 0,
    },
  ];

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-400";
    if (trend < 0) return "text-red-400";
    return "text-slate-400";
  };

  const formatTrend = (trend: number) => {
    if (trend === 0) return "Sin cambios";
    const sign = trend > 0 ? "+" : "";
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.title}
            className="glass-card rounded-[2rem] p-6 glass-card-hover animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-3 rounded-2xl", kpi.bg, kpi.color)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
            <div className="text-2xl font-bold text-white mt-1">{kpi.value}</div>
            {kpi.trend !== 0 && (
              <p className={cn("text-xs mt-2", getTrendColor(kpi.trend))}>
                {formatTrend(kpi.trend)} vs mes anterior
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
