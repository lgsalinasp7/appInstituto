"use client";

import { TrendingUp, Users, Clock, DollarSign, Target } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { AlertsList } from "./AlertsList";
import type { AlertItem, RevenueData } from "../types";
import { useAuthStore } from "@/lib/store/auth-store";
import { DashboardStats } from "../services/dashboard.service";

interface EnrollmentDashboardProps {
  stats: DashboardStats;
}

export function EnrollmentDashboard({ stats }: EnrollmentDashboardProps) {
  const { user } = useAuthStore();
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
  // Actually, DashboardService doesn't fetch specific alerts list yet, only stats.
  // For this step, we'll assume alerts are passed or we need to add them to DashboardStats.
  // Looking at DashboardService, it returns OverdueAmount but not the list.
  // Let's use an empty list or we need to fetch alerts separately.
  // To avoid breaking, let's keep it empty or minimal.
  const alerts: AlertItem[] = [];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <DashboardHeader
        title="Panel de Control"
        subtitle={isAdmin ? "Vista general del instituto" : isVentas ? "Mis indicadores de ventas" : "Resumen de cartera y recaudos"}
        onFilterChange={handleFilterChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title={isVentas ? "Mis Ventas Hoy" : "Recaudo de Hoy"}
          value={dashboardStats.todayRevenue}
          icon={DollarSign}
          trend="up"
          trendValue="+0.0%"
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title={isVentas ? "Mis Ventas Mes" : "Recaudo del Mes"}
          value={dashboardStats.monthlyRevenue}
          icon={TrendingUp}
          trend="up"
          trendValue="+0.0%"
          gradient="from-blue-500 to-blue-600"
        />

        {(isVentas || isAdmin) && (
          <StatCard
            title="Tasa de Conversión"
            value={dashboardStats.conversionRate}
            icon={Target}
            trend="up"
            trendValue="+0.0%"
            gradient="from-purple-500 to-purple-600"
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
          />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        {!isVentas && <AlertsList alerts={alerts} />}
      </div>
    </div>
  );
}
