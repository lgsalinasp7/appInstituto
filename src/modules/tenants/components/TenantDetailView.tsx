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
import {
  ArrowLeft,
  Globe,
  Shield,
  Users,
  History,
  Settings,
  Clipboard,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  GraduationCap,
  CreditCard,
  Target,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TenantWithDetails, TenantStatus, TenantUser } from "../types";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

interface TenantDetailViewProps {
  tenant: TenantWithDetails;
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

  const theme = statusThemes[tenant.status] || statusThemes.ACTIVO;

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header */}
      <DashboardHeader
        title={tenant.name}
        subtitle="Detalles de la Organización"
      >
        <Link href="/admin/empresas">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </Button>
        </Link>
      </DashboardHeader>

      {/* Main Info Header Card */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden animate-fade-in-up">
        {/* Background Glow */}
        <div className={cn(
          "absolute -right-24 -top-24 w-64 h-64 rounded-full blur-[100px] opacity-10",
          theme.bg.split(' ')[0]
        )} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-4xl shadow-2xl">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                  {tenant.name}
                </h1>
                <div className={cn(
                  "text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-xl border transition-all",
                  theme.color, theme.bg, theme.border, theme.glow
                )}>
                  {statusLabels[tenant.status]}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-slate-500 hover:text-cyan-400 transition-colors">
                <Globe size={14} />
                <span className="text-sm font-bold tracking-tight">{tenantUrl}</span>
                <ExternalLink size={12} className="ml-1 opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tenant.status === "ACTIVO" ? (
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border-red-500/20 text-red-500 font-bold"
                onClick={handleSuspend}
              >
                Suspender
              </Button>
            ) : tenant.status === "SUSPENDIDO" ? (
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl bg-green-500/5 hover:bg-green-500/10 border-green-500/20 text-green-500 font-bold"
                onClick={handleActivate}
              >
                Activar
              </Button>
            ) : null}
            <Button className="h-12 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10">
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3 animate-fade-in-up animation-delay-100">
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative group overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Plan Contratado</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Shield size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{tenant.plan}</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative group overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Usuarios Activos</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users size={18} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{tenant._count?.users || 0}</span>
              <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-widest">/ 5 máx</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative group overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Alumnos Totales</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <GraduationCap size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{tenant._count?.students || 0}</div>
          </div>
        </div>
      </div>

      {/* Grid of Detailed Info */}
      <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up animation-delay-200">
        {/* General Details */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-500 border border-slate-800">
              <Target size={18} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Información de Negocio</h3>
          </div>
          <div className="space-y-4">
            <InfoRow label="Nombre legal" value={tenant.name} />
            <InfoRow label="Identificador slug" value={tenant.slug} />
            <InfoRow label="Email de contacto" value={tenant.email || "No definido"} />
            <InfoRow label="Plan asignado" value={tenant.plan} />
            <InfoRow
              label="Fecha de registro"
              value={new Date(tenant.createdAt).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-purple-500 border border-slate-800">
              <Globe size={18} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Información Técnica</h3>
          </div>
          <div className="space-y-4">
            <InfoRow label="ID de sistema" value={tenant.id} copyable />
            <InfoRow
              label="Hostname personalizado"
              value={tenant.domain || "No configurado"}
            />
            <InfoRow label="Volumen de alumnos" value={`${tenant._count?.students || 0}`} />
            <InfoRow label="Transacciones POS" value={`${tenant._count?.payments || 0}`} />
          </div>
        </div>
      </div>

      {/* Credentials Area */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 animate-fade-in-up animation-delay-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-500 border border-slate-800">
            <Shield size={18} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Credenciales de Acceso</h3>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Dashboard URL</label>
            <div className="flex gap-2">
              <Input value={tenantUrl} readOnly className="bg-slate-900/50 border-slate-800 h-12 rounded-xl text-white font-medium focus:ring-0" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(tenantUrl)}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400"
              >
                <Clipboard size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(tenantUrl, "_blank")}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400"
              >
                <ExternalLink size={18} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              Admin Principal
            </label>
            <div className="flex gap-2">
              <Input
                value={tenant.adminUser?.email || tenant.email || "No definido"}
                readOnly
                className="bg-slate-900/50 border-slate-800 h-12 rounded-xl text-white font-medium focus:ring-0"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  copyToClipboard(
                    tenant.adminUser?.email || tenant.email || ""
                  )
                }
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400"
              >
                <Clipboard size={18} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              Password Temporal
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={tempPassword || "••••••••"}
                  readOnly
                  className="bg-slate-900/50 border-slate-800 h-12 rounded-xl text-white font-medium pr-12 focus:ring-0"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleResetPassword}
                disabled={resettingPassword}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400"
              >
                {resettingPassword ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tabs Area */}
      <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden animate-fade-in-up animation-delay-400">
        <Tabs defaultValue="usuarios" className="w-full">
          <div className="px-8 pt-4 border-b border-white/5 bg-slate-900/40">
            <TabsList className="h-auto p-0 bg-transparent gap-8">
              <TabsTrigger
                value="usuarios"
                className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-0 py-4 text-slate-500 font-bold tracking-tight transition-all flex items-center gap-2"
              >
                <Users size={16} /> Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="ordenes"
                className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-0 py-4 text-slate-500 font-bold tracking-tight transition-all flex items-center gap-2"
              >
                <CreditCard size={16} /> Órdenes
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-0 py-4 text-slate-500 font-bold tracking-tight transition-all flex items-center gap-2"
              >
                <History size={16} /> Logs de Auditoría
              </TabsTrigger>
              <TabsTrigger
                value="configuracion"
                className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-0 py-4 text-slate-500 font-bold tracking-tight transition-all flex items-center gap-2"
              >
                <Settings size={16} /> Configuración Plan
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="usuarios" className="m-0 focus-visible:ring-0">
            <div className="p-8">
              <UsersTab users={tenant.users} />
            </div>
          </TabsContent>

          <TabsContent value="ordenes" className="m-0 focus-visible:ring-0">
            <div className="p-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 mx-auto mb-4 opacity-20">
                <CreditCard size={32} />
              </div>
              <h4 className="text-slate-300 font-bold">Sin órdenes de facturación</h4>
              <p className="text-slate-500 text-sm mt-1">Este tenant no ha generado cargos adicionales.</p>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="m-0 focus-visible:ring-0">
            <div className="p-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 mx-auto mb-4 opacity-20">
                <History size={32} />
              </div>
              <h4 className="text-slate-300 font-bold">Sin actividad reciente</h4>
              <p className="text-slate-500 text-sm mt-1">Los eventos de auditoría aparecerán aquí.</p>
            </div>
          </TabsContent>

          <TabsContent value="configuracion" className="m-0 focus-visible:ring-0">
            <div className="p-8">
              <ConfigurationTab tenant={tenant} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
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
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 group/row">
      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-300 truncate max-w-[250px] tracking-tight">
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 px-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-cyan-400 transition-all opacity-0 group-hover/row:opacity-100 shadow-sm"
            title="Copiar"
          >
            <Clipboard size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function UsersTab({ users }: { users: TenantUser[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
        <p className="text-slate-500 font-bold">Sin usuarios administrativos</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
              Nombre Completo
            </th>
            <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
              Email Corporativo
            </th>
            <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
              Rol Asignado
            </th>
            <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
              Status
            </th>
            <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
              Fecha Alta
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
              <td className="py-4 px-4 text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                {user.name || "Sin nombre"}
              </td>
              <td className="py-4 px-4 text-sm font-medium text-slate-400">{user.email}</td>
              <td className="py-4 px-4 text-sm">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  {user.role?.name || "Sin rol"}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                  user.isActive
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-slate-900 text-slate-500 border-slate-800"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-green-400 animate-pulse" : "bg-slate-500")} />
                  {user.isActive ? "Activo" : "Inactivo"}
                </div>
              </td>
              <td className="py-4 px-4 text-sm font-medium text-slate-500">
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
    <div className="space-y-10 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Shield size={16} />
          </div>
          <h3 className="text-md font-bold text-white tracking-tight">Límites de Infraestructura</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="p-6 rounded-[1.5rem] bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Suscritos</p>
            <p className="text-2xl font-black text-white">5/5</p>
            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-full" />
            </div>
          </div>
          <div className="p-6 rounded-[1.5rem] bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Estudiantes</p>
            <p className="text-2xl font-black text-white">{tenant._count?.students || 0}/500</p>
            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-1/4" />
            </div>
          </div>
          <div className="p-6 rounded-[1.5rem] bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Storage (Cloud)</p>
            <p className="text-2xl font-black text-white">0.5 GB/10 GB</p>
            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[5%]" />
            </div>
          </div>
          <div className="p-6 rounded-[1.5rem] bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Level Support</p>
            <p className="text-2xl font-black text-cyan-400">PRIORITY</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
            <Settings size={16} />
          </div>
          <h3 className="text-md font-bold text-white tracking-tight">Acciones Críticas</h3>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-11 rounded-xl bg-slate-900 border-slate-800 text-slate-400 hover:text-white font-bold">
            Exportar Dataset Completo
          </Button>
          <Button variant="outline" className="h-11 rounded-xl bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold">
            Eliminar Tenant del Ecosistema
          </Button>
        </div>
      </div>
    </div>
  );
}
