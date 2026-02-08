import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { DollarSign, Building2 } from "lucide-react";
import { SuscripcionesClient } from "./SuscripcionesClient";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

export const metadata: Metadata = {
  title: "Suscripciones | Admin KaledSoft",
  description: "Gestión de suscripciones y planes de la plataforma",
};

export const dynamic = "force-dynamic";

// Const types pattern (typescript skill)
const PLAN_PRICES = {
  BASICO: 49,
  PROFESIONAL: 149,
  EMPRESARIAL: 499,
} as const;

type PlanName = keyof typeof PLAN_PRICES;

const PLAN_COLORS = {
  BASICO: "text-blue-400 bg-blue-500/10",
  PROFESIONAL: "text-purple-400 bg-purple-500/10",
  EMPRESARIAL: "text-cyan-400 bg-cyan-500/10",
} as const;

export default async function SuscripcionesPage() {
  // Promise.all for parallel queries (async-parallel)
  const [tenants, tenantsByPlan] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
    }),
    prisma.tenant.groupBy({ by: ["plan"], _count: true }),
  ]);

  // Calculate MRR
  const mrr = tenantsByPlan.reduce((sum, group) => {
    const price = PLAN_PRICES[group.plan as PlanName] ?? 0;
    return sum + price * group._count;
  }, 0);

  const planCounts = tenantsByPlan.reduce<Record<string, number>>((acc, g) => {
    acc[g.plan] = g._count;
    return acc;
  }, {});

  const statCards = [
    {
      title: "MRR Total",
      value: `$${mrr.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Plan Básico",
      value: planCounts["BASICO"] ?? 0,
      icon: Building2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Plan Profesional",
      value: planCounts["PROFESIONAL"] ?? 0,
      icon: Building2,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Plan Empresarial",
      value: planCounts["EMPRESARIAL"] ?? 0,
      icon: Building2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  // server-serialization: only pass serializable data
  const serializedTenants = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    plan: t.plan,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    usersCount: t._count.users,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Gestión de"
        titleHighlight="Suscripciones"
        subtitle="Gestiona los planes y suscripciones de tus empresas"
      />

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="glass-card rounded-[2rem] p-6 glass-card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <SuscripcionesClient tenants={serializedTenants} planColors={PLAN_COLORS} />
    </div>
  );
}
