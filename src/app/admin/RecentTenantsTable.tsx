"use client";

import { cn } from "@/lib/utils";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { TablePagination } from "@/components/ui/table-pagination";

const STATUS_COLORS = {
  ACTIVO: "bg-green-500/10 text-green-400",
  PENDIENTE: "bg-yellow-500/10 text-yellow-400",
  SUSPENDIDO: "bg-red-500/10 text-red-400",
  CANCELADO: "bg-slate-500/10 text-slate-400",
} as const;

const PLAN_COLORS = {
  BASICO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROFESIONAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  EMPRESARIAL: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
} as const;

interface RecentTenant {
  id: string;
  name: string;
  plan: string;
  status: string;
  createdAt: Date | string;
}

interface RecentTenantsTableProps {
  tenants: RecentTenant[];
}

export function RecentTenantsTable({ tenants }: RecentTenantsTableProps) {
  const { page, totalPages, totalItems, pageSize, paginatedItems, setPage } =
    useTablePagination(tenants, 6);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Empresa
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Plan
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Estado
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Creado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                  No hay empresas registradas aún
                </td>
              </tr>
            ) : (
              paginatedItems.map((tenant) => (
                <tr key={tenant.id} className="group">
                  <td className="py-3 pr-4">
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {tenant.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-lg border",
                        PLAN_COLORS[tenant.plan as keyof typeof PLAN_COLORS] ??
                          "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}
                    >
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-lg",
                        STATUS_COLORS[tenant.status as keyof typeof STATUS_COLORS] ??
                          "bg-slate-500/10 text-slate-400"
                      )}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-slate-500">
                      {new Intl.DateTimeFormat("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(tenant.createdAt))}
                    </span>
                  </td>
                </tr>
              ))
            )}
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
  );
}
