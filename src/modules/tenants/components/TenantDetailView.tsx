"use client";

/**
 * Tenant Detail View Component
 * Displays full tenant details with tabs
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { TenantWithDetails, TenantStatus, TenantUser } from "../types";

interface TenantDetailViewProps {
  tenant: TenantWithDetails;
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

export function TenantDetailView({ tenant }: TenantDetailViewProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const tenantUrl = `https://${tenant.slug}.${rootDomain}`;

  const handleResetPassword = async () => {
    if (!confirm("¿Estás seguro de resetear la contraseña del administrador?")) {
      return;
    }

    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setTempPassword(data.data.tempPassword);
        setShowPassword(true);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm("¿Estás seguro de suspender este tenant?")) return;

    try {
      await fetch(`/api/admin/tenants/${tenant.id}/suspend`, { method: "POST" });
      router.refresh();
    } catch (error) {
      console.error("Error suspending tenant:", error);
    }
  };

  const handleActivate = async () => {
    try {
      await fetch(`/api/admin/tenants/${tenant.id}/activate`, { method: "POST" });
      router.refresh();
    } catch (error) {
      console.error("Error activating tenant:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/empresas"
        className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#1e3a5f] transition-colors"
      >
        <span>←</span>
        <span>Volver a Empresas</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#1e3a5f]">{tenant.name}</h1>
            <Badge className={`${statusColors[tenant.status]} border`}>
              {statusLabels[tenant.status]}
            </Badge>
          </div>
          <p className="text-[#64748b] mt-1">{tenantUrl}</p>
        </div>
        <div className="flex gap-2">
          {tenant.status === "ACTIVO" ? (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleSuspend}
            >
              Suspender
            </Button>
          ) : tenant.status === "SUSPENDIDO" ? (
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={handleActivate}
            >
              Activar
            </Button>
          ) : null}
          <Button variant="outline">Editar</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 animate-fade-in-up animation-delay-100">
        <Card className="shadow-instituto border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  tenant.status === "ACTIVO"
                    ? "bg-green-100"
                    : tenant.status === "SUSPENDIDO"
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
              >
                <span className="text-xl">
                  {tenant.status === "ACTIVO"
                    ? "✓"
                    : tenant.status === "SUSPENDIDO"
                    ? "⚠"
                    : "○"}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#64748b] uppercase">Estado</p>
                <p className="text-lg font-semibold text-[#1e3a5f]">
                  {statusLabels[tenant.status]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-instituto border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <p className="text-xs text-[#64748b] uppercase">Plan</p>
                <p className="text-lg font-semibold text-[#1e3a5f]">
                  {tenant.plan}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-instituto border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-xs text-[#64748b] uppercase">Usuarios</p>
                <p className="text-lg font-semibold text-[#1e3a5f]">
                  {tenant._count?.users || 0}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up animation-delay-200">
        {/* General Info */}
        <Card className="shadow-instituto border-0">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f] text-lg">
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Nombre" value={tenant.name} />
            <InfoRow label="Slug" value={tenant.slug} />
            <InfoRow label="Email" value={tenant.email || "No definido"} />
            <InfoRow label="Plan" value={tenant.plan} />
            <InfoRow
              label="Fecha de creación"
              value={new Date(tenant.createdAt).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card className="shadow-instituto border-0">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f] text-lg">
              Información Técnica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="ID" value={tenant.id} copyable />
            <InfoRow
              label="Dominio personalizado"
              value={tenant.domain || "No configurado"}
            />
            <InfoRow label="Estudiantes" value={`${tenant._count?.students || 0}`} />
            <InfoRow label="Pagos" value={`${tenant._count?.payments || 0}`} />
          </CardContent>
        </Card>
      </div>

      {/* Credentials Section */}
      <Card className="shadow-instituto border-0 animate-fade-in-up animation-delay-300">
        <CardHeader>
          <CardTitle className="text-[#1e3a5f] text-lg">
            Credenciales de Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs text-[#64748b] uppercase">URL</label>
              <div className="flex gap-2">
                <Input value={tenantUrl} readOnly className="bg-gray-50" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(tenantUrl)}
                  title="Copiar URL"
                >
                  📋
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(tenantUrl, "_blank")}
                  title="Abrir en nueva pestaña"
                >
                  🔗
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#64748b] uppercase">
                Usuario Principal
              </label>
              <div className="flex gap-2">
                <Input
                  value={tenant.adminUser?.email || tenant.email || "No definido"}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(
                      tenant.adminUser?.email || tenant.email || ""
                    )
                  }
                  title="Copiar email"
                >
                  📋
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#64748b] uppercase">
                Password Temporal
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={tempPassword || "••••••••"}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? "🙈" : "👁"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  title="Resetear contraseña"
                >
                  🔄
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card className="shadow-instituto border-0 animate-fade-in-up animation-delay-400">
        <Tabs defaultValue="usuarios" className="w-full">
          <CardHeader className="border-b pb-0">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger
                value="usuarios"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="ordenes"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                Órdenes
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                Logs
              </TabsTrigger>
              <TabsTrigger
                value="configuracion"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                Configuración
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="usuarios" className="m-0">
            <CardContent className="pt-6">
              <UsersTab users={tenant.users} />
            </CardContent>
          </TabsContent>

          <TabsContent value="ordenes" className="m-0">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-[#64748b]">
                <p>No hay órdenes registradas</p>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="logs" className="m-0">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-[#64748b]">
                <p>No hay logs disponibles</p>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="configuracion" className="m-0">
            <CardContent className="pt-6">
              <ConfigurationTab tenant={tenant} />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-[#64748b]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#1e3a5f] truncate max-w-[200px]">
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-[#64748b] hover:text-[#1e3a5f] transition-colors"
            title="Copiar"
          >
            📋
          </button>
        )}
      </div>
    </div>
  );
}

function UsersTab({ users }: { users: TenantUser[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-[#64748b]">
        <p>No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-xs text-[#64748b] uppercase font-medium">
              Nombre
            </th>
            <th className="text-left py-3 px-4 text-xs text-[#64748b] uppercase font-medium">
              Email
            </th>
            <th className="text-left py-3 px-4 text-xs text-[#64748b] uppercase font-medium">
              Rol
            </th>
            <th className="text-left py-3 px-4 text-xs text-[#64748b] uppercase font-medium">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-xs text-[#64748b] uppercase font-medium">
              Fecha de creación
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-[#1e3a5f]">
                {user.name || "Sin nombre"}
              </td>
              <td className="py-3 px-4 text-sm text-[#64748b]">{user.email}</td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="text-xs">
                  {user.role?.name || "Sin rol"}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge
                  className={`text-xs ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {user.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-[#64748b]">
                {new Date(user.createdAt).toLocaleDateString("es-CO")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfigurationTab({ tenant }: { tenant: TenantWithDetails }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4">
          Límites del Plan
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-[#64748b]">Usuarios máximos</p>
            <p className="text-lg font-semibold text-[#1e3a5f]">5</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-[#64748b]">Estudiantes máximos</p>
            <p className="text-lg font-semibold text-[#1e3a5f]">500</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-[#64748b]">Almacenamiento</p>
            <p className="text-lg font-semibold text-[#1e3a5f]">10 GB</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-[#64748b]">Soporte</p>
            <p className="text-lg font-semibold text-[#1e3a5f]">Email</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4">
          Acciones Avanzadas
        </h3>
        <div className="flex gap-4">
          <Button variant="outline" className="text-amber-600 border-amber-200">
            Exportar datos
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200">
            Eliminar tenant
          </Button>
        </div>
      </div>
    </div>
  );
}
