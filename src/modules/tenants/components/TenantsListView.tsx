"use client";

/**
 * Tenants List View Component
 * Displays tenant cards with search and filter functionality
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import type { Tenant, TenantStatus } from "../types";

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

const statusColors: Record<TenantStatus, string> = {
  ACTIVO: "bg-green-100 text-green-700 border-green-200",
  PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200",
  SUSPENDIDO: "bg-red-100 text-red-700 border-red-200",
  CANCELADO: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusLabels: Record<TenantStatus, string> = {
  ACTIVO: "Activo",
  PENDIENTE: "Pendiente",
  SUSPENDIDO: "Suspendido",
  CANCELADO: "Cancelado",
};

export function TenantsListView({
  tenants,
  pagination,
  filters,
}: TenantsListViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const [status, setStatus] = useState(filters.status);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    router.push(`/admin/empresas?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    router.push("/admin/empresas");
  };

  const handleSuspend = async (tenantId: string) => {
    if (!confirm("¿Estás seguro de suspender este tenant?")) return;

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

  return (
    <div className="space-y-6 animate-fade-in-up animation-delay-200">
      {/* Search and Filters */}
      <Card className="shadow-instituto border-0">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, slug o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                  <SelectItem value="SUSPENDIDO">Suspendidos</SelectItem>
                  <SelectItem value="CANCELADO">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} variant="outline">
                Buscar
              </Button>
              {(filters.search || filters.status) && (
                <Button onClick={handleClearFilters} variant="ghost">
                  Limpiar
                </Button>
              )}
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-primary hover:bg-primary/90"
            >
              + Nuevo Tenant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Tenant Modal */}
      {isCreating && (
        <CreateTenantModal onClose={() => setIsCreating(false)} />
      )}

      {/* Tenants Grid */}
      {tenants.length === 0 ? (
        <Card className="shadow-instituto border-0">
          <CardContent className="p-12 text-center">
            <p className="text-[#64748b]">No se encontraron tenants</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onSuspend={() => handleSuspend(tenant.id)}
              onActivate={() => handleActivate(tenant.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (filters.search) params.set("search", filters.search);
                  if (filters.status) params.set("status", filters.status);
                  params.set("page", page.toString());
                  router.push(`/admin/empresas?${params.toString()}`);
                }}
              >
                {page}
              </Button>
            )
          )}
        </div>
      )}
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
  const tenantUrl = `https://${tenant.slug}.${rootDomain}`;

  return (
    <Card className="shadow-instituto border-0 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-[#1e3a5f]">{tenant.name}</CardTitle>
            <p className="text-xs text-[#64748b] mt-1">{tenantUrl}</p>
          </div>
          <Badge className={`${statusColors[tenant.status]} border`}>
            {statusLabels[tenant.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tenant Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[#64748b] text-xs">App</p>
            <p className="font-medium text-[#1e3a5f]">{tenant.name}</p>
          </div>
          <div>
            <p className="text-[#64748b] text-xs">Plan</p>
            <p className="font-medium text-[#1e3a5f]">{tenant.plan}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[#64748b] text-xs">Email</p>
            <p className="font-medium text-[#1e3a5f] truncate">
              {tenant.email || "No definido"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-[#64748b] border-t pt-3">
          <span>👥 {tenant._count?.users || 0} usuarios</span>
          <span>🎓 {tenant._count?.students || 0} estudiantes</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {tenant.status === "ACTIVO" ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={onSuspend}
            >
              Suspender
            </Button>
          ) : tenant.status === "SUSPENDIDO" ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
              onClick={onActivate}
            >
              Activar
            </Button>
          ) : null}
          <Link href={`/admin/empresas/${tenant.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Ver detalle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 shadow-xl">
        <CardHeader>
          <CardTitle className="text-[#1e3a5f]">Crear Nuevo Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1e3a5f]">
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
              <label className="text-sm font-medium text-[#1e3a5f]">
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
              <p className="text-xs text-[#64748b]">
                URL: https://{formData.slug || "slug"}.kaledsoft.tech
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1e3a5f]">
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
                <label className="text-sm font-medium text-[#1e3a5f]">
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
                <label className="text-sm font-medium text-[#1e3a5f]">
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
              <label className="text-sm font-medium text-[#1e3a5f]">Plan</label>
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
                variant="outline"
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
