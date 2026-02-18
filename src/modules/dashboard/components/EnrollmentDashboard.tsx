"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Users, Clock, DollarSign, Target, Calendar, Loader2 } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { AlertsList } from "./AlertsList";
import { AdvisorPerformanceTable } from "./AdvisorPerformanceTable";
import { CarteraUserTable } from "./CarteraUserTable";
import type { AlertItem, RevenueData } from "../types";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAdvisorFilter } from "@/lib/auth-context";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface DashboardApiStats {
  todayRevenue: number;
  monthlyRevenue: number;
  revenueChange: number;
  activeStudents: number;
  studentsChange: number;
  pendingPaymentsCount: number;
  overdueAmount: number;
  pendingChange: number;
  conversionRate: number;
  revenueChart?: { name: string; total: number }[];
}

export function EnrollmentDashboard() {
  const { user } = useAuthStore();
  const { appendToUrl } = useAdvisorFilter();
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
  const userRole = user?.role?.name || "USER";
  const isVentas = userRole === "VENTAS";
  const isCartera = userRole === "CARTERA";
  const isAdmin = userRole === "ADMINISTRADOR" || userRole === "SUPERADMIN";

  const [stats, setStats] = useState<DashboardApiStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async (advisorIdOverride?: string, programIdOverride?: string) => {
    setLoading(true);
    try {
      let url = "/api/reports/dashboard";
      // Para VENTAS, el backend fuerza advisorId automáticamente
      // Para admin con filtros manuales:
      const params = new URLSearchParams();
      if (advisorIdOverride && advisorIdOverride !== "all") {
        params.set("advisorId", advisorIdOverride);
      }
      if (programIdOverride && programIdOverride !== "all") {
        params.set("programId", programIdOverride);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      // appendToUrl agrega advisorId para VENTAS en el frontend también
      url = appendToUrl(url);

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [appendToUrl]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleFilterChange = (advisorId?: string, programId?: string) => {
    fetchDashboard(advisorId, programId);
  };

  const dashboardStats = stats ? {
    todayRevenue: `$${Number(stats.todayRevenue).toLocaleString("es-CO")}`,
    monthlyRevenue: `$${Number(stats.monthlyRevenue).toLocaleString("es-CO")}`,
    overdueAmount: `$${Number(stats.overdueAmount).toLocaleString("es-CO")}`,
    activeStudents: String(stats.activeStudents),
    conversionRate: `${Math.round(stats.conversionRate)}%`,
    revenueChange: stats.revenueChange,
    studentsChange: stats.studentsChange,
  } : null;

  const revenueData: RevenueData[] = stats?.revenueChart || [];
  const alerts: AlertItem[] = [];
  const userName = user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12 animate-fade-in-up">
      {/* Welcome Header */}
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

      {loading || !dashboardStats ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
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
              trend={dashboardStats.revenueChange >= 0 ? "up" : "down"}
              trendValue={`${dashboardStats.revenueChange >= 0 ? "+" : ""}${dashboardStats.revenueChange.toFixed(1)}%`}
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
                trend={dashboardStats.studentsChange >= 0 ? "up" : "down"}
                trendValue={`${dashboardStats.studentsChange >= 0 ? "+" : ""}${dashboardStats.studentsChange.toFixed(1)}%`}
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

          {isAdmin && (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
              <AdvisorPerformanceTable />
              <CarteraUserTable />
            </div>
          )}
        </>
      )}
    </div>
  );
}
