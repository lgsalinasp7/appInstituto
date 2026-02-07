/**
 * Empresas (Tenants) List Page
 * Super-admin tenant management dashboard
 */

import { Suspense } from "react";
import { TenantsService } from "@/modules/tenants";
import { TenantsListView } from "@/modules/tenants/components/TenantsListView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

export const dynamic = "force-dynamic";

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; plan?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [stats, tenantsData] = await Promise.all([
    TenantsService.getStats(),
    TenantsService.getAll({
      search: params.search,
      status: params.status as any,
      plan: params.plan,
      page: parseInt(params.page || "1"),
      limit: 12,
    }),
  ]);

  const statCards = [
    { title: "Total", value: stats.total, color: "bg-slate-50 text-slate-600", icon: "🏢" },
    { title: "Activas", value: stats.activos, color: "bg-green-50 text-green-600", icon: "✓" },
    { title: "Pendientes", value: stats.pendientes, color: "bg-amber-50 text-amber-600", icon: "⏳" },
    { title: "Suspendidas", value: stats.suspendidos, color: "bg-red-50 text-red-600", icon: "⚠" },
    { title: "Canceladas", value: stats.cancelados, color: "bg-gray-50 text-gray-500", icon: "✗" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <DashboardHeader
        title="Gestión de Empresas"
        subtitle="Tenants y Organizaciones"
      />

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-5 animate-fade-in-up animation-delay-100">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="glass-card p-6 rounded-[2rem] hover:scale-[1.02] transition-all group relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20 ${stat.color.split(' ')[0]}`} />

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {stat.title}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border shadow-sm ${stat.color} border-current/20`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tenants List */}
      <Suspense fallback={<TenantsListSkeleton />}>
        <TenantsListView
          tenants={tenantsData.tenants}
          pagination={{
            page: tenantsData.page,
            limit: tenantsData.limit,
            total: tenantsData.total,
            totalPages: tenantsData.totalPages,
          }}
          filters={{
            search: params.search || "",
            status: params.status || "",
            plan: params.plan || "",
          }}
        />
      </Suspense>
    </div>
  );
}

function TenantsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
