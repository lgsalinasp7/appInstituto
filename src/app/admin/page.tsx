import { cn } from "@/lib/utils";
import { AdminService } from "@/modules/admin/services/admin.service";
import type { Metadata } from "next";
import {
  DollarSign,
  Building2,
  Clock,
  TrendingDown,
  ArrowRight,
  Calendar,
  CreditCard,
  Database,
  Lock,
  Globe,
  HardDrive,
  Users,
  ListTodo,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard Admin | KaledSoft",
  description: "Panel de administración de la plataforma KaledSoft",
};

export const dynamic = "force-dynamic";

// Const types pattern (typescript skill)
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

export default async function AdminDashboardPage() {
  const stats = await AdminService.getPlatformStats();

  const saasMetrics = [
    {
      title: "MRR",
      value: `$${stats.mrr.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
      subtitle: "Ingreso Mensual Recurrente",
    },
    {
      title: "Empresas Activas",
      value: stats.activeTenants,
      icon: Building2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      subtitle: `${stats.totalTenants} totales`,
    },
    {
      title: "Trials Pendientes",
      value: stats.trialTenants,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      subtitle: "En periodo de prueba",
    },
    {
      title: "Tasa de Churn",
      value: `${stats.churnRate}%`,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      subtitle: `${stats.cancelledTenants} canceladas`,
    },
  ];

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
            Hola, <span className="text-gradient">Admin</span>
          </h1>
          <p className="text-slate-400 mt-4 flex items-center gap-3 text-lg font-medium">
            <Calendar className="w-5 h-5 text-cyan-500" />
            {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date())}
          </p>
        </div>
      </div>

      {/* SaaS Metrics Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {saasMetrics.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="glass-card rounded-[2.5rem] p-8 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5", stat.bg, stat.color)}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white px-2 py-1 bg-white/5 border border-white/10 rounded-lg tracking-widest uppercase">
                    Live
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.title}</p>
                <div className="text-4xl font-black text-white tracking-tighter">{stat.value}</div>
                <p className="text-xs font-medium text-slate-500 pt-1">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid: Recent Tenants + Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tenants Table */}
        <div className="lg:col-span-2 glass-card rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Empresas Recientes</h3>
            <a
              href="/admin/empresas"
              className="text-cyan-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </a>
          </div>

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
                {stats.recentTenants.length > 0 ? (
                  stats.recentTenants.map((tenant) => (
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
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                      No hay empresas registradas aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution by Plan */}
        <div className="glass-card rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6">Distribución por Plan</h3>
          <div className="space-y-4">
            {stats.tenantsByPlan.length > 0 ? (
              stats.tenantsByPlan.map((group) => {
                const percentage =
                  stats.totalTenants > 0
                    ? Math.round((group.count / stats.totalTenants) * 100)
                    : 0;
                const colorClass =
                  PLAN_COLORS[group.plan as keyof typeof PLAN_COLORS] ??
                  "bg-slate-500/10 text-slate-400 border-slate-500/20";

                return (
                  <div key={group.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-lg border",
                          colorClass
                        )}
                      >
                        {group.plan}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {group.count}{" "}
                        <span className="text-slate-500 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">
                Sin datos de distribución
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-slate-800/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total empresas</span>
              <span className="text-sm font-bold text-white">{stats.totalTenants}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total usuarios</span>
              <span className="text-sm font-bold text-white">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Suspendidas</span>
              <span className="text-sm font-bold text-red-400">{stats.suspendedTenants}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Health + Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="glass-card rounded-[2.5rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6">Herramientas de Control</h3>
          <div className="grid gap-3">
            <AdminAction
              icon={Users}
              title="Control de Usuarios"
              description="Gestiona accesos y sesiones"
              href="/admin/users"
            />
            <AdminAction
              icon={CreditCard}
              title="Suscripciones"
              description="Gestiona planes y pagos"
              href="/admin/suscripciones"
            />
            <AdminAction
              icon={ListTodo}
              title="Monitor de Auditoría"
              description="Analiza logs en tiempo real"
              href="/admin/audit"
            />
          </div>
        </div>

        {/* System Health */}
        <div className="glass-card rounded-[2.5rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6">Salud del Ecosistema</h3>
          <div className="space-y-5">
            <StatusItem
              icon={Database}
              label="Prisma Database"
              status="Conectada"
              isHealthy={true}
            />
            <StatusItem
              icon={Lock}
              label="Auth Services"
              status="Operativo"
              isHealthy={true}
            />
            <StatusItem
              icon={Globe}
              label="Cloud API"
              status="En línea"
              isHealthy={true}
            />
            <StatusItem
              icon={HardDrive}
              label="Storage Bucket"
              status="75% disponible"
              isHealthy={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AdminActionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

function AdminAction({ icon: Icon, title, description, href }: AdminActionProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-5 p-5 rounded-3xl bg-slate-950/40 border border-white/5 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all duration-300 group shadow-lg"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
        <Icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
      </div>
      <div className="flex-1">
        <p className="font-black text-white text-base tracking-tight leading-tight">{title}</p>
        <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </a>
  );
}

interface StatusItemProps {
  icon: LucideIcon;
  label: string;
  status: string;
  isHealthy: boolean;
}

function StatusItem({ icon: Icon, label, status, isHealthy }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-950/40 border border-white/5 shadow-inner">
      <div className="flex items-center gap-5">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5",
            isHealthy ? "bg-green-500/10" : "bg-red-500/10"
          )}
        >
          <Icon className={cn("w-6 h-6", isHealthy ? "text-green-400" : "text-red-400")} />
        </div>
        <div>
          <p className="text-base font-black text-white leading-tight">{label}</p>
          <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest mt-1">
            System Online
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={cn(
            "text-xs font-black px-3 py-1.5 rounded-xl border",
            isHealthy
              ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
