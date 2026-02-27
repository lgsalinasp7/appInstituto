"use client";

import { Database, RefreshCw, Clock } from "lucide-react";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { TablePagination } from "@/components/ui/table-pagination";

interface Model {
  provider: string;
  model: string;
  freeTokens: number;
  resetPeriod: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  description: string;
}

interface FreeTierReferenceTableProps {
  models: Model[];
}

export function FreeTierReferenceTable({ models }: FreeTierReferenceTableProps) {
  const {
    page,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
  } = useTablePagination(models, 6);

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000000) {
      return `${(tokens / 1000000000).toFixed(1)}B`;
    }
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(0)}M`;
    }
    return tokens.toLocaleString("es-CO");
  };

  const getResetBadgeColor = (period: string) => {
    switch (period) {
      case "DAILY":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "MONTHLY":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "ONCE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getResetIcon = (period: string) => {
    switch (period) {
      case "DAILY":
        return <Clock className="w-4 h-4" />;
      case "MONTHLY":
        return <RefreshCw className="w-4 h-4" />;
      case "ONCE":
        return <Database className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getResetText = (period: string) => {
    switch (period) {
      case "DAILY":
        return "Diario";
      case "MONTHLY":
        return "Mensual";
      case "ONCE":
        return "Una Vez";
      default:
        return period;
    }
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            Límites Gratuitos por Proveedor
          </h3>
          <p className="text-sm text-slate-400">
            Comparativa de free tiers disponibles
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
                Costo Input
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                Costo Output
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                Descripción
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((model, index) => (
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
                  <div className="text-sm font-bold text-green-400">
                    {formatTokens(model.freeTokens)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getResetBadgeColor(model.resetPeriod)}`}
                    >
                      {getResetIcon(model.resetPeriod)}
                      {getResetText(model.resetPeriod)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-xs text-slate-300">
                    ${model.inputCostPer1M.toFixed(2)}/1M
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-xs text-slate-300">
                    ${model.outputCostPer1M.toFixed(2)}/1M
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs text-slate-400 max-w-xs">
                    {model.description}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Leyenda */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Clock className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Diario</p>
              <p className="text-xs text-slate-400">Se reinicia cada día</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <RefreshCw className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Mensual</p>
              <p className="text-xs text-slate-400">Se reinicia cada mes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Database className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Una Vez</p>
              <p className="text-xs text-slate-400">Crédito único</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
