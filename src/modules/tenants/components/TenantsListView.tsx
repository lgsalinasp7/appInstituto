"use client";

/**
 * Tenants List View Component
 * Displays tenant cards with search and filter functionality
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ExternalLink, Users, GraduationCap, Shield, MoreVertical, Loader2, X, ArrowLeft, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tenant, TenantStatus } from "../types";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { useConfirmModal } from "@/components/modals/use-confirm-modal";
import { toast } from "sonner";

interface TenantsListViewProps {
  tenants: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    status: string;
    plan: string;
  };
}

const statusThemes: Record<TenantStatus, { color: string; bg: string; border: string; glow: string }> = {
  ACTIVO: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", glow: "shadow-[0_0_8px_rgba(74,222,128,0.3)]" },
  PENDIENTE: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", glow: "shadow-[0_0_8px_rgba(251,191,36,0.3)]" },
  SUSPENDIDO: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", glow: "shadow-[0_0_8px_rgba(248,113,113,0.3)]" },
  CANCELADO: { color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", glow: "" },
};

const statusLabels: Record<TenantStatus, string> = {
  ACTIVO: "Activo",
  PENDIENTE: "Pendiente",
  SUSPENDIDO: "Suspendido",
  CANCELADO: "Cancelado",
};

import { getTenantLogo } from "@/lib/tenant-logo";

export function TenantsListView({
  tenants,
  pagination,
  filters,
}: TenantsListViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState(filters.search);
  const [status, setStatus] = useState(filters.status);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { confirm, confirmModal } = useConfirmModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    router.push(`/admin/empresas?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    router.push("/admin/empresas");
  };

  const handleSuspend = async (tenantId: string) => {
    const isConfirmed = await confirm({
      title: "Suspender tenant",
      description: "¿Estás seguro de suspender este tenant?",
      confirmText: "Suspender",
      cancelText: "Cancelar",
      variant: "destructive",
    });

    if (!isConfirmed) return;

    try {
      await fetch(`/api/admin/tenants/${tenantId}/suspend`, { method: "POST" });
      router.refresh();
    } catch (error) {
      console.error("Error suspending tenant:", error);
    }
  };

  const handleActivate = async (tenantId: string) => {
    try {
      await fetch(`/api/admin/tenants/${tenantId}/activate`, { method: "POST" });
      router.refresh();
    } catch (error) {
      console.error("Error activating tenant:", error);
    }
  };

  const sortedTenants = [...tenants].sort((a, b) => {
    const aIsKaled = a.slug?.toLowerCase() === "kaledsoft";
    const bIsKaled = b.slug?.toLowerCase() === "kaledsoft";
    if (aIsKaled && !bIsKaled) return -1;
    if (!aIsKaled && bIsKaled) return 1;
    return 0;
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in-up animation-delay-200">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-3 bg-slate-950/40 border border-white/5 rounded-[2.5rem] glass-card shadow-2xl">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <Input
            placeholder="Nombre, slug o email de la organización..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent border-0 h-16 pl-16 pr-8 focus-visible:ring-0 text-white text-lg placeholder:text-slate-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950/60 rounded-[2rem] w-full lg:w-auto border border-white/5">
          <Select value={status || "all"} onValueChange={setStatus}>
            <SelectTrigger className="w-full lg:w-[160px] bg-transparent border-0 h-12 text-slate-300 focus:ring-0">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="ACTIVO">Activos</SelectItem>
              <SelectItem value="PENDIENTE">Pendientes</SelectItem>
              <SelectItem value="SUSPENDIDO">Suspendidos</SelectItem>
              <SelectItem value="CANCELADO">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-slate-800 mx-1 hidden lg:block" />
          <Button
            onClick={handleSearch}
            className="rounded-xl px-6 h-12 bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
          >
            Filtrar
          </Button>
          {(filters.search || (filters.status && filters.status !== "all")) && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              className="rounded-xl h-12 px-4 text-slate-500 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/50 border border-white/5">
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "cards"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
              title="Vista en tarjetas"
              aria-label="Vista en tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "table"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
              title="Vista en tabla"
              aria-label="Vista en tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="rounded-xl px-4 sm:px-6 h-11 sm:h-12 text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-all font-bold shadow-lg flex-1 sm:flex-initial min-w-[100px]"
          >
            <Plus className="w-4 h-4 mr-2 shrink-0" /> Empresa
          </Button>
        </div>
      </div>

      {/* Create Tenant Modal */}
      {isCreating && (
        <CreateTenantModal onClose={() => setIsCreating(false)} />
      )}

      {/* Tenants Content */}
      {tenants.length === 0 ? (
        <div className="glass-card p-24 text-center rounded-[3rem]">
          <Search className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">Sin coincidencias</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">No logramos encontrar ninguna empresa con los parámetros especificados.</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onSuspend={() => handleSuspend(tenant.id)}
              onActivate={() => handleActivate(tenant.id)}
            />
          ))}
        </div>
      ) : (
        <TenantsTable
          tenants={sortedTenants}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3 pt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (filters.search) params.set("search", filters.search);
                  if (filters.status && filters.status !== "all") params.set("status", filters.status);
                  params.set("page", page.toString());
                  router.push(`/admin/empresas?${params.toString()}`);
                }}
                className={cn(
                  "w-12 h-12 rounded-2xl font-bold transition-all border",
                  page === pagination.page
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "bg-slate-900/50 text-slate-500 border-slate-800/50 hover:border-slate-700 hover:text-slate-300"
                )}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}
      {confirmModal}
    </div>
  );
}

function TenantCard({
  tenant,
  onSuspend,
  onActivate,
}: {
  tenant: Tenant;
  onSuspend: () => void;
  onActivate: () => void;
}) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const tenantUrl = `${tenant.slug}.${rootDomain}`;
  const theme = statusThemes[tenant.status] || statusThemes.ACTIVO;
  const logoConfig = getTenantLogo(tenant);

  return (
    <div className="glass-card group rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 border border-slate-800/50 hover:border-cyan-500/30 relative">
      <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-700 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform shadow-inner",
                logoConfig?.whiteBg ? "bg-white" : "bg-gradient-to-br from-slate-800 to-slate-900"
              )}
            >
              {logoConfig ? (
                <Image
                  src={logoConfig.src}
                  alt={logoConfig.alt}
                  width={56}
                  height={56}
                  className={cn(
                    "w-full h-full object-contain p-1 sm:p-1.5",
                    logoConfig.blendMultiply && "mix-blend-multiply"
                  )}
                />
              ) : (
                <span className="text-lg sm:text-2xl">🏢</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base sm:text-xl text-white group-hover:text-cyan-400 transition-colors tracking-tight leading-tight truncate">
                {tenant.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 text-slate-500 transition-colors hover:text-cyan-500 group-last:text-blue-400 min-w-0">
                <span className="text-[10px] sm:text-xs font-medium tracking-tight truncate max-w-[120px] sm:max-w-[150px]">
                  {tenantUrl}
                </span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </div>
            </div>
          </div>
          <div className={cn(
            "flex-shrink-0 text-[9px] sm:text-[10px] uppercase tracking-widest font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all",
            theme.color, theme.bg, theme.border, theme.glow
          )}>
            {statusLabels[tenant.status]}
          </div>
        </div>

        {/* Tenant Info & Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/40 border border-slate-800 group-hover:border-slate-700 transition-all">
            <div className="flex items-center gap-2 mb-0.5 sm:mb-1 text-slate-500">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Usuarios</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white">{tenant._count?.users || 0}</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/40 border border-slate-800 group-hover:border-slate-700 transition-all">
            <div className="flex items-center gap-2 mb-0.5 sm:mb-1 text-slate-500">
              <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Alumnos</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white">{tenant._count?.students || 0}</div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-cyan-500/5 group/plan border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-cyan-500/50 leading-none mb-0.5">Plan Contratado</div>
              <div className="text-xs sm:text-sm font-bold text-cyan-400 truncate">{tenant.plan}</div>
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 italic">MRR: $0.00</div>
        </div>

        {/* Actions Button Bar */}
        <div className="flex gap-2 pt-1 sm:pt-2">
          {tenant.status === "ACTIVO" ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-red-500/10 border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-bold text-[10px] sm:text-xs"
              onClick={onSuspend}
            >
              Suspender
            </Button>
          ) : tenant.status === "SUSPENDIDO" ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-green-500/10 border-slate-800 hover:border-green-500/30 text-slate-400 hover:text-green-400 font-bold text-[10px] sm:text-xs"
              onClick={onActivate}
            >
              Activar
            </Button>
          ) : null}
          <Link href={`/admin/empresas/${tenant.id}`} className="flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900 border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 font-bold transition-all text-[10px] sm:text-xs"
            >
              Gestionar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TenantsTable({
  tenants,
  onSuspend,
  onActivate,
}: {
  tenants: Tenant[];
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
}) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";

  return (
    <div className="glass-card rounded-2xl sm:rounded-[2rem] border border-slate-800/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Empresa</th>
              <th className="text-left px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Slug / URL</th>
              <th className="text-center px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
              <th className="text-center px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Plan</th>
              <th className="text-center px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Usuarios</th>
              <th className="text-right px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tenants.map((tenant) => {
              const theme = statusThemes[tenant.status] || statusThemes.ACTIVO;
              const logoConfig = getTenantLogo(tenant);

              return (
                <tr
                  key={tenant.id}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden",
                          logoConfig?.whiteBg ? "bg-white" : "bg-gradient-to-br from-slate-800 to-slate-900"
                        )}
                      >
                        {logoConfig ? (
                          <Image
                            src={logoConfig.src}
                            alt={logoConfig.alt}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-sm">🏢</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white truncate max-w-[160px]">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors">
                      <span className="text-xs font-mono truncate max-w-[140px]">{tenant.slug}.{rootDomain}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                    <span className={cn(
                      "inline-flex text-[9px] sm:text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border",
                      theme.color, theme.bg, theme.border
                    )}>
                      {statusLabels[tenant.status]}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                    <span className="text-xs font-bold text-cyan-400">{tenant.plan}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                    <span className="text-sm font-bold text-white">{tenant._count?.users || 0}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-2">
                      {tenant.status === "ACTIVO" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-lg bg-transparent hover:bg-red-500/10 border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-400 font-bold text-[10px]"
                          onClick={() => onSuspend(tenant.id)}
                        >
                          Suspender
                        </Button>
                      )}
                      {tenant.status === "SUSPENDIDO" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-lg bg-transparent hover:bg-green-500/10 border-slate-800 hover:border-green-500/30 text-slate-500 hover:text-green-400 font-bold text-[10px]"
                          onClick={() => onActivate(tenant.id)}
                        >
                          Activar
                        </Button>
                      )}
                      <Link href={`/admin/empresas/${tenant.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-lg bg-transparent border-slate-800 hover:border-cyan-500/30 text-slate-500 hover:text-cyan-400 font-bold text-[10px]"
                        >
                          Gestionar
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateTenantModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    plan: "BASICO",
    adminName: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError("Error al crear el tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData({ ...formData, name, slug });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="glass-card rounded-[2rem] border border-white/5 w-full max-w-lg mx-4 shadow-xl text-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-200">Crear Nuevo Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Nombre de la empresa
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Instituto Edutec"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Slug (URL)
              </label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="Ej: edutec"
                required
              />
              <p className="text-xs text-slate-400">
                URL: https://{formData.slug || "slug"}.kaledsoft.tech
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Email del administrador
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="admin@empresa.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Nombre del admin
                </label>
                <Input
                  value={formData.adminName}
                  onChange={(e) =>
                    setFormData({ ...formData, adminName: e.target.value })
                  }
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Contraseña temporal
                </label>
                <Input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, adminPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Plan</label>
              <Select
                value={formData.plan}
                onValueChange={(value) =>
                  setFormData({ ...formData, plan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASICO">Básico</SelectItem>
                  <SelectItem value="PROFESIONAL">Profesional</SelectItem>
                  <SelectItem value="EMPRESARIAL">Empresarial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline-dark"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? "Creando..." : "Crear Tenant"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
