"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import type { TopTenant } from "@/modules/chat/types/agent.types";
import { TablePagination } from "@/components/ui/table-pagination";

export function TopTenantsTable() {
  const [data, setData] = useState<TopTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/agents/top-tenants?page=${page}&limit=${pageSize}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data.items || []);
          setTotalItems(result.data.total || 0);
          setTotalPages(result.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching top tenants:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page]);

  return (
    <div className="glass-card rounded-[2rem] p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
          <Building2 className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-white">
          Top Tenants por Consumo
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
                  #
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Tenant
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Tokens
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Mensajes
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Costo (COP)
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  % Total
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((tenant, index) => (
                <tr
                  key={tenant.tenantId}
                  className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-slate-400">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {tenant.tenantName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {tenant.tenantSlug}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-white text-right font-medium">
                    {tenant.totalTokens.toLocaleString("es-CO")}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 text-right">
                    {tenant.totalMessages.toLocaleString("es-CO")}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-400 text-right font-medium">
                    ${tenant.totalCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-purple-400 text-right">
                    {tenant.percentage.toFixed(1)}%
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
          No hay datos de consumo disponibles
        </div>
      )}
    </div>
  );
}
