"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Users, Clock, DollarSign, Target } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { AlertsList } from "./AlertsList";
import type { AlertItem, RevenueData } from "../types";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  DEMO_REVENUE_CHART,
  DEMO_CARTERA_ALERTS
} from "../data/demo-data";

interface DashboardStatsData {
  todayRevenue: number;
  monthlyRevenue: number;
  overdueAmount: number;
  activeStudents: number;
  conversionRate: number;
  revenueChart?: RevenueData[];
}

export function EnrollmentDashboard() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const userRole = user?.role?.name || "USER";
  const isVentas = userRole === "VENTAS";
  const isCartera = userRole === "CARTERA";
  const isAdmin = userRole === "ADMINISTRADOR" || userRole === "SUPERADMIN";

  const fetchStats = useCallback(async (advisorId?: string, programId?: string) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // Force advisorId if the user is VENTAS
      const effectiveAdvisorId = isVentas ? user?.id : advisorId;

      if (effectiveAdvisorId && effectiveAdvisorId !== "all") {
        queryParams.append("advisorId", effectiveAdvisorId);
      }

      if (programId && programId !== "all") queryParams.append("programId", programId);

      const response = await fetch(`/api/reports/dashboard?${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, [isVentas, user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilterChange = useCallback((advisorId?: string, programId?: string) => {
    fetchStats(advisorId, programId);
  }, [fetchStats]);

  // React 19 Compiler optimizes this automatically - no useMemo needed
  const dashboardStats = !stats ? {
    todayRevenue: "$0",
    monthlyRevenue: "$0",
    overdueAmount: "$0",
    activeStudents: "0",
    conversionRate: "0%"
  } : {
    todayRevenue: `$${Number(stats.todayRevenue).toLocaleString("es-CO")}`,
    monthlyRevenue: `$${Number(stats.monthlyRevenue).toLocaleString("es-CO")}`,
    overdueAmount: `$${Number(stats.overdueAmount).toLocaleString("es-CO")}`,
    activeStudents: String(stats.activeStudents),
    conversionRate: `${Math.round(stats.conversionRate)}%`
  };

  const revenueData: RevenueData[] = stats?.revenueChart || DEMO_REVENUE_CHART;

  const alerts: AlertItem[] = DEMO_CARTERA_ALERTS.slice(0, 5).map((a) => ({
    name: a.studentName,
    amount: `$${a.amount.toLocaleString()}`,
    date: a.type === "overdue" ? `Hace ${a.daysOverdue} días` : a.type === "today" ? "Hoy" : new Date(a.dueDate).toLocaleDateString("es-CO"),
    type: a.type === "overdue" ? "overdue" : "pending",
  }));

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
    </div>
  </div>;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <DashboardHeader
        title="Panel de Control"
        subtitle={isAdmin ? "Vista general del instituto" : isVentas ? "Mis indicadores de ventas" : "Resumen de cartera y recaudos"}
        onFilterChange={handleFilterChange}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Siempre visible: Recaudo Hoy y Mes */}
        <StatCard
          title={isVentas ? "Mis Ventas Hoy" : "Recaudo de Hoy"}
          value={dashboardStats.todayRevenue}
          icon={DollarSign}
          trend="up"
          trendValue="+8.2%"
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title={isVentas ? "Mis Ventas Mes" : "Recaudo del Mes"}
          value={dashboardStats.monthlyRevenue}
          icon={TrendingUp}
          trend="up"
          trendValue="+12.5%"
          gradient="from-blue-500 to-blue-600"
        />

        {/* Solo VENTAS o ADMIN ve Tasa de Conversión */}
        {(isVentas || isAdmin) && (
          <StatCard
            title="Tasa de Conversión"
            value={dashboardStats.conversionRate}
            icon={Target}
            trend="up"
            trendValue="+2.4%"
            gradient="from-purple-500 to-purple-600"
          />
        )}

        {/* Solo CARTERA o ADMIN ve Cartera Vencida */}
        {(isCartera || isAdmin) && (
          <StatCard
            title="Cartera Vencida"
            value={dashboardStats.overdueAmount}
            icon={Clock}
            trend="down"
            trendValue="-5.1%"
            gradient="from-orange-500 to-orange-600"
          />
        )}

        {/* Solo VENTAS o ADMIN ve Estudiantes Activos */}
        {(isVentas || isAdmin) && (
          <StatCard
            title="Estudiantes Activos"
            value={dashboardStats.activeStudents}
            icon={Users}
            trend="up"
            trendValue="+4.2%"
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
