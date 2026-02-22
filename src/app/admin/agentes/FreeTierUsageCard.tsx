"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { FreeTierUsage } from "@/modules/chat/types/agent.types";

interface FreeTierUsageCardProps {
  usage: FreeTierUsage;
}

export function FreeTierUsageCard({ usage }: FreeTierUsageCardProps) {
  const getStatusIcon = () => {
    switch (usage.status) {
      case "safe":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "danger":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getProgressColor = () => {
    switch (usage.status) {
      case "safe":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "danger":
        return "bg-red-500";
    }
  };

  const getStatusText = () => {
    switch (usage.status) {
      case "safe":
        return "Uso normal";
      case "warning":
        return "Acercándose al límite";
      case "danger":
        return "Límite casi alcanzado";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Uso de Free Tier - Gemini 2.0 Flash
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Tokens gratuitos mensuales
          </p>
        </div>
        {getStatusIcon()}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">
            {usage.used.toLocaleString("es-CO")} / {usage.limit.toLocaleString("es-CO")} tokens
          </span>
          <span className={cn("text-sm font-semibold", getProgressColor().replace("bg-", "text-"))}>
            {usage.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              getProgressColor()
            )}
            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
        <div>
          <p className="text-xs text-slate-400 mb-1">Estado</p>
          <p className="text-sm font-medium text-white">{getStatusText()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Restantes</p>
          <p className="text-sm font-medium text-white">
            {usage.remaining.toLocaleString("es-CO")}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Reinicia</p>
          <p className="text-sm font-medium text-white">
            {formatDate(usage.resetDate)}
          </p>
        </div>
      </div>
    </div>
  );
}
