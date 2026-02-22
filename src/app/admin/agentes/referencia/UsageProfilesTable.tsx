"use client";

import { Users, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";

interface Model {
  provider: string;
  model: string;
  freeTokens: number;
  resetPeriod: string;
}

interface UsageProfile {
  name: string;
  tokensPerMonth: number;
  conversationsPerMonth: number;
  tokensPerConversation: number;
}

interface UsageProfilesTableProps {
  profiles: Record<string, UsageProfile>;
  models: Model[];
}

export function UsageProfilesTable({ profiles, models }: UsageProfilesTableProps) {
  const [selectedProfile, setSelectedProfile] = useState("institute_small");

  const calculateDuration = (freeTokens: number, tokensPerMonth: number, resetPeriod: string) => {
    if (resetPeriod === "ONCE") {
      const months = Math.floor(freeTokens / tokensPerMonth);
      if (months > 12) {
        const years = Math.floor(months / 12);
        return `${years} ${years === 1 ? "año" : "años"}`;
      }
      return `${months} ${months === 1 ? "mes" : "meses"}`;
    }

    if (resetPeriod === "DAILY") {
      const tokensPerDay = tokensPerMonth / 30;
      const days = Math.floor(freeTokens / tokensPerDay);
      if (days > 365) {
        return "Ilimitado";
      }
      return `${days} días`;
    }

    if (resetPeriod === "MONTHLY") {
      const months = Math.floor(freeTokens / tokensPerMonth);
      if (months > 12) {
        return "Ilimitado";
      }
      return `${months} ${months === 1 ? "mes" : "meses"}`;
    }

    return "N/A";
  };

  const getDurationColor = (freeTokens: number, tokensPerMonth: number, resetPeriod: string) => {
    if (resetPeriod === "DAILY") {
      const tokensPerDay = tokensPerMonth / 30;
      const days = Math.floor(freeTokens / tokensPerDay);
      if (days >= 365) return "text-green-400";
      if (days >= 30) return "text-yellow-400";
      return "text-red-400";
    }

    if (resetPeriod === "MONTHLY") {
      const months = Math.floor(freeTokens / tokensPerMonth);
      if (months >= 12) return "text-green-400";
      if (months >= 3) return "text-yellow-400";
      return "text-red-400";
    }

    if (resetPeriod === "ONCE") {
      const months = Math.floor(freeTokens / tokensPerMonth);
      if (months >= 6) return "text-green-400";
      if (months >= 2) return "text-yellow-400";
      return "text-red-400";
    }

    return "text-slate-400";
  };

  const currentProfile = profiles[selectedProfile];

  return (
    <div className="space-y-6">
      {/* Selector de Perfil */}
      <div className="glass-card rounded-[2rem] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Perfil de Uso</h3>
            <p className="text-sm text-slate-400">
              Selecciona un perfil para calcular duración de free tier
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(profiles).map(([key, profile]) => (
            <button
              key={key}
              onClick={() => setSelectedProfile(key)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                selectedProfile === key
                  ? "bg-purple-500/10 border-purple-500/50 ring-2 ring-purple-500/20"
                  : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
              }`}
            >
              <div className="text-sm font-medium text-white mb-1">
                {profile.name}
              </div>
              <div className="text-xs text-slate-400">
                {profile.tokensPerMonth.toLocaleString("es-CO")} tokens/mes
              </div>
              <div className="text-xs text-slate-500">
                {profile.conversationsPerMonth} conversaciones
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas del Perfil Seleccionado */}
      <div className="glass-card rounded-[2rem] p-6">
        <h4 className="text-md font-bold text-white mb-4">
          📊 {currentProfile.name}
        </h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Tokens por Mes</p>
            <p className="text-lg font-bold text-purple-400">
              {currentProfile.tokensPerMonth.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Conversaciones por Mes</p>
            <p className="text-lg font-bold text-cyan-400">
              {currentProfile.conversationsPerMonth}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Tokens por Conversación</p>
            <p className="text-lg font-bold text-green-400">
              {currentProfile.tokensPerConversation.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Duración por Modelo */}
      <div className="glass-card rounded-[2rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Duración de Free Tier por Modelo
            </h3>
            <p className="text-sm text-slate-400">
              Cuánto tiempo duraría el free tier con el perfil seleccionado
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Proveedor
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Modelo
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Tokens Gratis
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">
                  Renovación
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Duración Estimada
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => {
                const duration = calculateDuration(
                  model.freeTokens,
                  currentProfile.tokensPerMonth,
                  model.resetPeriod
                );
                const durationColor = getDurationColor(
                  model.freeTokens,
                  currentProfile.tokensPerMonth,
                  model.resetPeriod
                );
                const isUnlimited = duration === "Ilimitado";

                return (
                  <tr
                    key={`${model.provider}-${model.model}-${index}`}
                    className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-white">
                        {model.provider}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-purple-400 font-medium">
                        {model.model}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-sm text-slate-300">
                        {(model.freeTokens / 1000000).toFixed(0)}M
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <span className="text-xs text-slate-400">
                          {model.resetPeriod === "DAILY" && "Diario"}
                          {model.resetPeriod === "MONTHLY" && "Mensual"}
                          {model.resetPeriod === "ONCE" && "Una Vez"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`text-sm font-bold ${durationColor}`}>
                        {duration}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        {isUnlimited ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/20">
                            ✓ Suficiente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                            ⚠ Limitado
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Nota */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">
            <strong>Nota:</strong> Los cálculos son estimaciones basadas en el uso promedio.
            Los modelos con renovación "Ilimitado" tienen suficiente free tier para el perfil seleccionado.
          </p>
        </div>
      </div>
    </div>
  );
}
