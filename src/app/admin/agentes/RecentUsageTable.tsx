"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { UsageLog } from "@/modules/chat/types/agent.types";
import { TablePagination } from "@/components/ui/table-pagination";

export function RecentUsageTable() {
  const [data, setData] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/agents/usage?page=${page}&limit=${pageSize}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data.logs);
          setTotalItems(result.data.total || 0);
          setTotalPages(result.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching usage logs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page]);

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-white">
          Uso Reciente
        </h3>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          Cargando datos...
        </div>
      ) : data.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Hora
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Tenant
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Modelo
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Entrada
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Salida
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Total
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Costo
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="text-xs text-white">
                      {formatDateTime(log.timestamp)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatRelativeTime(log.timestamp)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-white">
                      {log.tenantName || "N/A"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {log.tenantSlug || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-purple-400 font-medium">
                      {log.modelName}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 text-right">
                    {log.inputTokens.toLocaleString("es-CO")}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 text-right">
                    {log.outputTokens.toLocaleString("es-CO")}
                  </td>
                  <td className="py-3 px-4 text-sm text-white text-right font-medium">
                    {log.totalTokens.toLocaleString("es-CO")}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-400 text-right">
                    ${log.cost.toFixed(4)}
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
        </>
      ) : (
        <div className="py-8 text-center text-slate-500 text-sm">
          No hay logs de uso disponibles
        </div>
      )}
    </div>
  );
}
