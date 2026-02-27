"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { TablePagination } from "@/components/ui/table-pagination";

// Const types pattern (typescript skill)
const STATUS_LABELS = {
  ACTIVO: "Activo",
  PENDIENTE: "Pendiente",
  SUSPENDIDO: "Suspendido",
  CANCELADO: "Cancelado",
} as const;

const STATUS_COLORS = {
  ACTIVO: "bg-green-500/10 text-green-400",
  PENDIENTE: "bg-yellow-500/10 text-yellow-400",
  SUSPENDIDO: "bg-red-500/10 text-red-400",
  CANCELADO: "bg-slate-500/10 text-slate-400",
} as const;

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
  usersCount: number;
}

interface PlanColors {
  [key: string]: string;
}

interface SuscripcionesClientProps {
  tenants: TenantRow[];
  planColors: PlanColors;
}

export function SuscripcionesClient({ tenants, planColors }: SuscripcionesClientProps) {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === "ALL" || t.plan === filterPlan;
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });
  const {
    page,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
    resetPage,
  } = useTablePagination(filtered, 6);

  useEffect(() => {
    resetPage();
  }, [search, filterPlan, filterStatus, resetPage]);

  return (
    <div className="glass-card rounded-[2rem] p-8">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none text-sm placeholder:text-slate-600 text-white"
          />
        </div>

        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="h-11 px-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none focus:border-cyan-500/50"
        >
          <option value="ALL">Todos los planes</option>
          <option value="BASICO">Básico</option>
          <option value="PROFESIONAL">Profesional</option>
          <option value="EMPRESARIAL">Empresarial</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-11 px-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none focus:border-cyan-500/50"
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="SUSPENDIDO">Suspendido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* Table */}
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
                Usuarios
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Creado
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {filtered.length > 0 ? (
              paginatedItems.map((tenant) => (
                <tr key={tenant.id} className="group">
                  <td className="py-4 pr-4">
                    <div>
                      <span className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {tenant.name}
                      </span>
                      <p className="text-xs text-slate-500">{tenant.slug}.kaledsoft.tech</p>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-lg",
                        planColors[tenant.plan] ?? "bg-slate-500/10 text-slate-400"
                      )}
                    >
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-lg",
                        STATUS_COLORS[tenant.status as keyof typeof STATUS_COLORS] ??
                          "bg-slate-500/10 text-slate-400"
                      )}
                    >
                      {STATUS_LABELS[tenant.status as keyof typeof STATUS_LABELS] ?? tenant.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm text-slate-300">{tenant.usersCount}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-xs text-slate-500">
                      {new Intl.DateTimeFormat("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(tenant.createdAt))}
                    </span>
                  </td>
                  <td className="py-4">
                    <a
                      href={`/admin/empresas/${tenant.id}`}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Ver detalle
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                  No se encontraron empresas con los filtros aplicados
                </td>
              </tr>
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

      {/* Count */}
      <div className="mt-4 pt-4 border-t border-slate-800/30">
        <p className="text-xs text-slate-500">
          Mostrando {totalItems} de {tenants.length} empresas
        </p>
      </div>
    </div>
  );
}
