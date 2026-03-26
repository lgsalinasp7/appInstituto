"use client";

/**
 * Tenant Detail View Component
 * Displays full tenant details with tabs
 */

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  Pencil,
  UserPlus,
  Mail,
  Trash2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getTenantLogo } from "@/lib/tenant-logo";
import type { TenantWithDetails, TenantStatus, TenantUser } from "../types";
import { getAcademyRoleLabel } from "@/lib/academy-role-labels";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { TenantEditModal } from "./TenantEditModal";
import { TenantUserEditModal } from "./TenantUserEditModal";
import { InviteTrialModal } from "@/modules/academia/components/InviteTrialModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TenantDetailViewProps {
  tenant: TenantWithDetails;
  /** Si true, muestra el botón "Invitar estudiante" (solo para Super Admin en KaledAcademy) */
  canInviteAcademy?: boolean;
  /** SUPER_ADMIN: eliminar usuarios del instituto e invitaciones (cualquier estado) de forma definitiva */
  canHardDeleteUsers?: boolean;
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

export function TenantDetailView({
  tenant,
  canInviteAcademy = false,
  canHardDeleteUsers = false,
}: TenantDetailViewProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(
    tenant.generatedAdminPassword ?? null
  );
  const [resettingPassword, setResettingPassword] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "suspend" | "activate" | "reset-password" | null;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    type: null,
    title: "",
    description: "",
    action: async () => { },
  });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const tenantBaseUrl = `https://${tenant.slug}.${rootDomain}`;
  // Link a login para que el admin se autentique con credenciales del tenant, no con sesión de plataforma
  const tenantLoginUrl = `${tenantBaseUrl}/auth/login`;

  const executeAction = async () => {
    if (!confirmDialog.action) return;
    try {
      await confirmDialog.action();
    } catch (error) {
      console.error("Error executing action:", error);
    } finally {
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleResetPasswordClick = () => {
    setConfirmDialog({
      isOpen: true,
      type: "reset-password",
      title: "Resetear Contraseña",
      description: "¿Estás seguro de resetear la contraseña del administrador? Se generará una nueva contraseña temporal.",
      action: async () => {
        setResettingPassword(true);
        try {
          const res = await fetch(`/api/admin/tenants/${tenant.id}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          const data = await res.json();

          if (data.success) {
            setTempPassword(data.data.tempPassword);
            setShowPassword(true);
            toast.success("Contraseña restablecida. Cópiala antes de cerrar.");
          } else {
            toast.error(data.error || "Error al restablecer contraseña");
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          toast.error("Error al restablecer contraseña");
        } finally {
          setResettingPassword(false);
        }
      },
    });
  };

  const handleSuspendClick = () => {
    setConfirmDialog({
      isOpen: true,
      type: "suspend",
      title: "Suspender Tenant",
      description: "¿Estás seguro de suspender este tenant? Los usuarios no podrán acceder a la plataforma.",
      action: async () => {
        await fetch(`/api/admin/tenants/${tenant.id}/suspend`, { method: "POST" });
        router.refresh();
      },
    });
  };

  const handleActivateClick = () => {
    setConfirmDialog({
      isOpen: true,
      type: "activate",
      title: "Activar Tenant",
      description: "¿Estás seguro de reactivar este tenant? Los usuarios volverán a tener acceso.",
      action: async () => {
        await fetch(`/api/admin/tenants/${tenant.id}/activate`, { method: "POST" });
        router.refresh();
      },
    });
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
            {(() => {
              const logoConfig = getTenantLogo(tenant);
              return (
                <div className={cn(
                  "w-20 h-20 rounded-3xl border border-slate-700 flex items-center justify-center overflow-hidden shadow-2xl",
                  logoConfig?.whiteBg ? "bg-white" : "bg-gradient-to-br from-slate-800 to-slate-900"
                )}>
                  {logoConfig ? (
                    <Image
                      src={logoConfig.src}
                      alt={logoConfig.alt}
                      width={80}
                      height={80}
                      className={cn(
                        "w-full h-full object-contain p-1",
                        logoConfig.blendMultiply && "mix-blend-multiply"
                      )}
                    />
                  ) : (
                    <span className="text-4xl">🏢</span>
                  )}
                </div>
              );
            })()}
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
                <span className="text-sm font-bold tracking-tight">{tenantBaseUrl}</span>
                <ExternalLink size={12} className="ml-1 opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tenant.status === "ACTIVO" ? (
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border-red-500/20 text-red-500 font-bold"
                onClick={handleSuspendClick}
              >
                Suspender
              </Button>
            ) : tenant.status === "SUSPENDIDO" ? (
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl bg-green-500/5 hover:bg-green-500/10 border-green-500/20 text-green-500 font-bold"
                onClick={handleActivateClick}
              >
                Activar
              </Button>
            ) : null}
            {/* Botón Editar logic */}
            <Button
              className="h-12 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10"
              onClick={() => setIsEditModalOpen(true)}
            >
              Editar
            </Button>
            <TenantEditModal
              tenant={tenant}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSuccess={() => router.refresh()}
            />
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
          <div className="flex flex-col gap-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Descripción del software</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Target size={18} />
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              KaledSoft es una plataforma de gestión educativa para instituciones colombianas. Gestiona matrículas, estudiantes, programas académicos, pagos y reportes en un solo lugar.
            </p>
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
            <InfoRow
              label="Vencimiento Suscripción"
              value={tenant.subscriptionEndsAt
                ? new Date(tenant.subscriptionEndsAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "Indefinido"
              }
              valueClassName={tenant.subscriptionEndsAt && new Date(tenant.subscriptionEndsAt) < new Date() ? "text-red-400" : undefined}
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
              <Input value={tenantLoginUrl} readOnly className="bg-slate-900/50 border-slate-800 h-12 rounded-xl text-white font-medium focus:ring-0" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(tenantLoginUrl)}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400"
              >
                <Clipboard size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(tenantLoginUrl, "_blank")}
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
                  type="button"
                  onClick={() => {
                    if (!tempPassword) {
                      toast.info("Haz clic en el botón de actualizar para generar una contraseña temporal");
                      return;
                    }
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleResetPasswordClick}
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
              {canInviteAcademy && (
                <TabsTrigger
                  value="invitaciones"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-0 py-4 text-slate-500 font-bold tracking-tight transition-all flex items-center gap-2"
                >
                  <Mail size={16} /> Invitaciones
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="usuarios" className="m-0 focus-visible:ring-0">
            <div className="p-8">
              <UsersTab
                users={tenant.users}
                tenantId={tenant.id}
                tenantSlug={tenant.slug}
                onUserUpdated={() => router.refresh()}
                showInviteAcademy={canInviteAcademy}
                canHardDeleteUsers={canHardDeleteUsers}
              />
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
          {canInviteAcademy && (
            <TabsContent value="invitaciones" className="m-0 focus-visible:ring-0">
              <div className="p-8">
                <InvitationsTab
                  tenantId={tenant.id}
                  tenantSlug={tenant.slug}
                  onUpdated={() => router.refresh()}
                  canHardDeleteUsers={canHardDeleteUsers}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeAction}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.type === "suspend" ? "destructive" : "default"}
        confirmText={
          confirmDialog.type === "suspend" ? "Suspender" :
            confirmDialog.type === "activate" ? "Activar" :
              "Confirmar"
        }
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable = false,
  valueClassName,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  valueClassName?: string;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 group/row">
      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">{label}</span>
      <div className="flex items-center gap-3">
        <span className={cn("text-sm font-bold text-slate-300 truncate max-w-[250px] tracking-tight", valueClassName)}>
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

function UsersTab({
  users,
  tenantId,
  tenantSlug,
  onUserUpdated,
  showInviteAcademy = false,
  canHardDeleteUsers = false,
}: {
  users: TenantUser[];
  tenantId: string;
  tenantSlug: string;
  onUserUpdated: () => void;
  showInviteAcademy?: boolean;
  canHardDeleteUsers?: boolean;
}) {
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<TenantUser | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ACADEMY_STUDENT" | "ACADEMY_TEACHER" | "ACADEMY_ADMIN">("ACADEMY_STUDENT");
  const [inviteCohortId, setInviteCohortId] = useState("");
  const [inviteCohorts, setInviteCohorts] = useState<Array<{ id: string; name: string; courseTitle: string }>>([]);
  const [inviteCohortsLoading, setInviteCohortsLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const canShowInvite = showInviteAcademy;
  const {
    page,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
  } = useTablePagination(users, 6);

  useEffect(() => {
    if (!isInviteOpen || !canShowInvite) return;
    let cancelled = false;
    setInviteCohortsLoading(true);
    fetch(`/api/admin/tenants/${encodeURIComponent(tenantSlug)}/cohorts-for-invitation`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) setInviteCohorts(res.data);
        else setInviteCohorts([]);
      })
      .catch(() => {
        if (!cancelled) setInviteCohorts([]);
      })
      .finally(() => {
        if (!cancelled) setInviteCohortsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isInviteOpen, canShowInvite, tenantSlug]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Ingresa un correo electrónico");
      return;
    }
    if (inviteRole === "ACADEMY_STUDENT" && !inviteCohortId) {
      toast.error("Selecciona el cohorte donde quedará matriculado el estudiante");
      return;
    }
    setInviteLoading(true);
    try {
      const body: Record<string, unknown> = { email: inviteEmail.trim(), academyRole: inviteRole };
      if (inviteRole === "ACADEMY_STUDENT" && inviteCohortId) {
        body.academyCohortId = inviteCohortId;
      }
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(tenantSlug)}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Error al enviar la invitación");
        return;
      }
      toast.success(`Invitación enviada a ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("ACADEMY_STUDENT");
      setInviteCohortId("");
      setIsInviteOpen(false);
      onUserUpdated();
    } catch {
      toast.error("Error al enviar la invitación");
    } finally {
      setInviteLoading(false);
    }
  };

  if (users.length === 0 && !canShowInvite) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
        <p className="text-slate-500 font-bold">Sin usuarios administrativos</p>
      </div>
    );
  }

  const canEditUser = (u: TenantUser) => u.platformRole !== "SUPER_ADMIN";

  return (
    <>
      {canShowInvite && (
        <div className="flex justify-end gap-2 mb-6">
          <Button
            type="button"
            onClick={() => setIsTrialModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-xl px-6 py-2.5 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Invitar a versión prueba
          </Button>
          <Button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl px-6 py-2.5 font-bold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar estudiante
          </Button>
        </div>
      )}

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              Invitar estudiante a Kaled Academy
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              El usuario recibirá un correo con el enlace para crear su cuenta.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <Label htmlFor="invite-email" className="text-slate-400">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="estudiante@ejemplo.com"
                className="mt-1.5 bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div>
              <Label htmlFor="invite-role" className="text-slate-400">Rol</Label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => {
                  setInviteRole(e.target.value as typeof inviteRole);
                  if (e.target.value !== "ACADEMY_STUDENT") setInviteCohortId("");
                }}
                className="mt-1.5 w-full h-10 rounded-lg bg-slate-800 border border-slate-700 text-white px-3"
              >
                <option value="ACADEMY_STUDENT">Estudiante</option>
                <option value="ACADEMY_TEACHER">Profesor</option>
                <option value="ACADEMY_ADMIN">Administrador</option>
              </select>
            </div>
            {inviteRole === "ACADEMY_STUDENT" && (
              <div>
                <Label htmlFor="invite-cohort" className="text-slate-400">
                  Cohorte (matrícula al aceptar)
                </Label>
                {inviteCohortsLoading ? (
                  <p className="mt-1.5 text-xs text-slate-500">Cargando cohortes…</p>
                ) : (
                  <select
                    id="invite-cohort"
                    value={inviteCohortId}
                    onChange={(e) => setInviteCohortId(e.target.value)}
                    className="mt-1.5 w-full h-10 rounded-lg bg-slate-800 border border-slate-700 text-white px-3"
                    required
                  >
                    <option value="">— Cohorte activo —</option>
                    {inviteCohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.courseTitle}
                      </option>
                    ))}
                  </select>
                )}
                {inviteCohorts.length === 0 && !inviteCohortsLoading && (
                  <p className="mt-1 text-xs text-amber-200/90">Crea un cohorte activo en el curso antes de invitar.</p>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={inviteLoading} className="flex-1">
                {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar invitación"}
              </Button>
              <Button type="button" variant="outline-dark" onClick={() => setIsInviteOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <InviteTrialModal
        open={isTrialModalOpen}
        onOpenChange={setIsTrialModalOpen}
        onInviteSuccess={onUserUpdated}
        useAdminApi={true}
        adminTenantKey={tenantSlug}
      />

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
              <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((user) => (
              <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                <td className="py-4 px-4 text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {user.name || "Sin nombre"}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-slate-400">{user.email}</td>
                <td className="py-4 px-4 text-sm">
                  <div className="flex items-center gap-2">
                    {user.academyEnrollments?.length ? (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                        Prueba
                      </Badge>
                    ) : null}
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      {user.platformRole?.startsWith("ACADEMY_")
                        ? getAcademyRoleLabel(user.platformRole, "Sin rol")
                        : (user.role?.name || "Sin rol")}
                    </span>
                  </div>
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
                <td className="py-4 px-4">
                  {canEditUser(user) ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => setEditingUser(user)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Button>
                      {canHardDeleteUsers ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => setUserToDelete(user)}
                          title="Eliminar definitivamente"
                        >
                          <Trash2 size={16} />
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
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

      {editingUser && (
        <TenantUserEditModal
          user={editingUser}
          tenantId={tenantId}
          tenantSlug={tenantSlug}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            onUserUpdated();
            setEditingUser(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => !deleteUserLoading && setUserToDelete(null)}
        onConfirm={async () => {
          if (!userToDelete) return;
          setDeleteUserLoading(true);
          try {
            const res = await fetch(
              `/api/admin/tenants/${encodeURIComponent(tenantSlug)}/users/${encodeURIComponent(userToDelete.id)}`,
              { method: "DELETE", credentials: "include" }
            );
            const data = await res.json();
            if (data.success) {
              toast.success(data.message || "Usuario eliminado");
              setUserToDelete(null);
              onUserUpdated();
            } else {
              toast.error(data.error || "Error al eliminar");
            }
          } catch {
            toast.error("Error al eliminar usuario");
          } finally {
            setDeleteUserLoading(false);
          }
        }}
        title="Eliminar usuario del instituto"
        description={
          userToDelete
            ? `Se eliminará definitivamente la cuenta de ${userToDelete.email}. Los pagos y prospectos que registró pasarán a otro usuario del instituto. No procede si es asesor de estudiantes sin reasignar.`
            : ""
        }
        variant="destructive"
        confirmText="Eliminar definitivamente"
        isLoading={deleteUserLoading}
      />
    </>
  );
}

function InvitationsTab({
  tenantId: _tenantId,
  tenantSlug,
  onUpdated,
  canHardDeleteUsers = false,
}: {
  tenantId: string;
  tenantSlug: string;
  onUpdated: () => void;
  canHardDeleteUsers?: boolean;
}) {
  void _tenantId;
  const [invitations, setInvitations] = useState<Array<{
    id: string;
    email: string;
    status: string;
    academyRole: string | null;
    createdAt: string;
    inviter: { name: string | null; email: string };
    role: { name: string };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inviteToDelete, setInviteToDelete] = useState<{
    id: string;
    email: string;
    status: string;
  } | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantSlug}/invitations`);
      const data = await res.json();
      if (data.success) setInvitations(data.data);
    } catch {
      toast.error("Error al cargar invitaciones");
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const runInvitationDelete = async () => {
    if (!inviteToDelete) return;
    setDeletingId(inviteToDelete.id);
    try {
      const res = await fetch(
        `/api/admin/tenants/${encodeURIComponent(tenantSlug)}/invitations/${encodeURIComponent(inviteToDelete.id)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Invitación eliminada");
        setInviteToDelete(null);
        fetchInvitations();
        onUpdated();
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar invitación");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
        <p className="text-slate-500 font-bold">No hay invitaciones enviadas</p>
        <p className="text-slate-600 text-sm mt-1">Las invitaciones aparecerán aquí cuando las envíes desde la pestaña Usuarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white">Invitaciones enviadas</h3>
      <p className="text-sm text-slate-400">
        Como super administrador puedes eliminar cualquier registro de invitación. Las pendientes pueden borrar también
        el usuario huérfano si aplica. Las ya aceptadas solo quitan el historial de invitación; la cuenta sigue en
        Usuarios hasta que la elimines ahí.
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/60">
              <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Email</th>
              <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Rol</th>
              <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Estado</th>
              <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Fecha</th>
              <th className="text-left py-4 px-4 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="py-4 px-4 text-sm font-medium text-white">{inv.email}</td>
                <td className="py-4 px-4 text-sm text-slate-400">
                  {inv.academyRole ? getAcademyRoleLabel(inv.academyRole) : inv.role.name}
                </td>
                <td className="py-4 px-4">
                  <Badge
                    className={cn(
                      "text-[10px]",
                      inv.status === "PENDING"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : inv.status === "ACCEPTED"
                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                    )}
                  >
                    {inv.status === "PENDING" ? "Pendiente" : inv.status === "ACCEPTED" ? "Aceptada" : "Expirada"}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-sm text-slate-500">
                  {new Date(inv.createdAt).toLocaleDateString("es-CO")}
                </td>
                <td className="py-4 px-4">
                  {canHardDeleteUsers ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() =>
                        setInviteToDelete({ id: inv.id, email: inv.email, status: inv.status })
                      }
                      disabled={deletingId === inv.id}
                      title="Eliminar invitación"
                    >
                      {deletingId === inv.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!inviteToDelete}
        onClose={() => !deletingId && setInviteToDelete(null)}
        onConfirm={runInvitationDelete}
        title="Eliminar invitación"
        description={
          inviteToDelete
            ? inviteToDelete.status === "PENDING"
              ? `Se eliminará la invitación pendiente a ${inviteToDelete.email}. Si hubo un usuario huérfano sin matrícula, también se borrará.`
              : `Se eliminará el registro de invitación de ${inviteToDelete.email} (estado: ${inviteToDelete.status}). Si ya aceptó, su cuenta de usuario no se borra automáticamente.`
            : ""
        }
        variant="destructive"
        confirmText="Eliminar"
        isLoading={!!deletingId && inviteToDelete?.id === deletingId}
      />
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
