import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { DollarSign, Building2, Users, GraduationCap } from "lucide-react";
import { MetricasCharts } from "./MetricasCharts";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

export const metadata: Metadata = {
  title: "Métricas | Admin KaledSoft",
  description: "KPIs y tendencias de la plataforma KaledSoft",
};

export const dynamic = "force-dynamic";

// Const types pattern (typescript skill)
const PLAN_PRICES = {
  BASICO: 49,
  PROFESIONAL: 149,
  EMPRESARIAL: 499,
} as const;

type PlanName = keyof typeof PLAN_PRICES;

export default async function MetricasPage() {
  // Promise.all for parallel queries (async-parallel)
  const [
    totalTenants,
    totalUsers,
    totalStudents,
    tenantsByPlan,
    topByStudents,
    topByPayments,
    growthData,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.student.count(),
    prisma.tenant.groupBy({ by: ["plan"], _count: true }),
    prisma.tenant.findMany({
      take: 5,
      orderBy: { students: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        plan: true,
        _count: { select: { students: true } },
      },
    }),
    prisma.tenant.findMany({
      take: 5,
      orderBy: { payments: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        plan: true,
        _count: { select: { payments: true } },
      },
    }),
    // Tenants created in last 6 months - raw query for date grouping
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*)::bigint as count
      FROM "Tenant"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `,
  ]);

  // Calculate MRR
  const mrr = tenantsByPlan.reduce((sum, group) => {
    const price = PLAN_PRICES[group.plan as PlanName] ?? 0;
    return sum + price * group._count;
  }, 0);

  // server-serialization: serialize for client components
  const planDistribution = tenantsByPlan.map((g) => ({
    plan: g.plan,
    count: g._count,
    percentage: totalTenants > 0 ? Math.round((g._count / totalTenants) * 100) : 0,
  }));

  const monthlyGrowth = growthData.map((g) => ({
    month: g.month,
    count: Number(g.count),
  }));

  const topStudents = topByStudents.map((t) => ({
    name: t.name,
    plan: t.plan,
    count: t._count.students,
  }));

  const topPayments = topByPayments.map((t) => ({
    name: t.name,
    plan: t.plan,
    count: t._count.payments,
  }));

  const kpis = [
    {
      title: "MRR",
      value: `$${mrr.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Total Empresas",
      value: totalTenants,
      icon: Building2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Total Usuarios",
      value: totalUsers,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Estudiantes",
      value: totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Métricas de"
        titleHighlight="Plataforma"
        subtitle="KPIs, tendencias y análisis del ecosistema KaledSoft"
      />

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="glass-card rounded-[2rem] p-6 glass-card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-3 rounded-2xl", kpi.bg, kpi.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
              <div className="text-2xl font-bold text-white mt-1">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts & Data */}
      <MetricasCharts
        planDistribution={planDistribution}
        monthlyGrowth={monthlyGrowth}
        topStudents={topStudents}
        topPayments={topPayments}
      />
    </div>
  );
}
