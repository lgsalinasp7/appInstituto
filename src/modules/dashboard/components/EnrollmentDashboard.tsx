"use client";

import { TrendingUp, Users, Clock, DollarSign, Target, Calendar } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { AlertsList } from "./AlertsList";
import type { AlertItem, RevenueData } from "../types";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";
import { DashboardStats } from "../services/dashboard.service";

interface EnrollmentDashboardProps {
  stats: DashboardStats;
}

export function EnrollmentDashboard({ stats }: EnrollmentDashboardProps) {
  const { user } = useAuthStore();
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
  const userRole = user?.role?.name || "USER";
  const isVentas = userRole === "VENTAS";
  const isCartera = userRole === "CARTERA";
  const isAdmin = userRole === "ADMINISTRADOR" || userRole === "SUPERADMIN";

  const handleFilterChange = (advisorId?: string, programId?: string) => {
    // TODO: Implement Client-Side filtering or URL params navigation 
    // For now, filtering might require reloading page with search params if we want it server-side
    // or we can keep some client-side fetch if filtering is dynamic.
    // Given the architecture shift to Server Components, dynamic filtering often uses URL params.
    console.log("Filter change:", advisorId, programId);
  };

  const dashboardStats = {
    todayRevenue: `$${Number(stats.todayRevenue).toLocaleString("es-CO")}`,
    monthlyRevenue: `$${Number(stats.monthlyRevenue).toLocaleString("es-CO")}`,
    overdueAmount: `$${Number(stats.overdueAmount).toLocaleString("es-CO")}`,
    activeStudents: String(stats.activeStudents),
    conversionRate: `15%`, // Hardcoded or calculated? Service has it as placeholder
  };

  // Transform or use revenueChart provided by stats
  const revenueData: RevenueData[] = stats.revenueChart || [];

  // Transform alerts (not yet in DashboardStats, waiting for next step refactor?)
  const alerts: AlertItem[] = [];

  const userName = user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12 animate-fade-in-up">
      {/* Welcome Header - Estilo Amaxoft con sistema de diseño del tenant */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
        <div className="pt-2 sm:pt-4">
          <h1
            className={cn(
              "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-none font-display",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Hola,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${branding.primaryColor}, ${branding.accentColor})`,
              }}
            >
              {userName}
            </span>
          </h1>
          <p
            className={cn(
              "mt-3 sm:mt-4 flex items-center gap-3 text-base sm:text-lg font-medium",
              isDark ? "text-slate-400" : "text-slate-500"
            )}
          >
            <Calendar
              className={cn("w-5 h-5", isDark ? "text-cyan-500" : "")}
              style={!isDark ? { color: branding.primaryColor } : undefined}
            />
            {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date())}
          </p>
        </div>
      </div>

      <DashboardHeader
        title="Panel de Control"
        subtitle={isAdmin ? "Vista general" : isVentas ? "Mis ventas" : "Resumen cartera"}
        onFilterChange={handleFilterChange}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <StatCard
          title={isVentas ? "Mis Ventas Hoy" : "Recaudo de Hoy"}
          value={dashboardStats.todayRevenue}
          icon={DollarSign}
          trend="up"
          trendValue="+0.0%"
          gradient="from-emerald-500 to-emerald-600"
          delay={100}
        />
        <StatCard
          title={isVentas ? "Mis Ventas Mes" : "Recaudo del Mes"}
          value={dashboardStats.monthlyRevenue}
          icon={TrendingUp}
          trend="up"
          trendValue="+0.0%"
          gradient="from-blue-500 to-blue-600"
          delay={200}
        />

        {(isVentas || isAdmin) && (
          <StatCard
            title="Tasa de Conversión"
            value={dashboardStats.conversionRate}
            icon={Target}
            trend="up"
            trendValue="+0.0%"
            gradient="from-purple-500 to-purple-600"
            delay={300}
          />
        )}

        {(isCartera || isAdmin) && (
          <StatCard
            title="Cartera Vencida"
            value={dashboardStats.overdueAmount}
            icon={Clock}
            trend="down"
            trendValue="-0.0%"
            gradient="from-orange-500 to-orange-600"
            delay={400}
          />
        )}

        {(isVentas || isAdmin) && (
          <StatCard
            title="Estudiantes Activos"
            value={dashboardStats.activeStudents}
            icon={Users}
            trend="up"
            trendValue="+0.0%"
            gradient="from-primary to-primary-light"
            delay={500}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        {!isVentas && <AlertsList alerts={alerts} />}
      </div>
    </div>
  );
}
