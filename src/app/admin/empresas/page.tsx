/**
 * Empresas (Tenants) List Page
 * Super-admin tenant management dashboard
 */

import { Suspense } from "react";
import { TenantsService } from "@/modules/tenants";
import { TenantsListView } from "@/modules/tenants/components/TenantsListView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">Empresas</h1>
        <p className="text-[#64748b] mt-1">
          Gestión de tenants y organizaciones
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5 animate-fade-in-up animation-delay-100">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="shadow-instituto border-0"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-[#64748b] uppercase">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <span className="text-sm">{stat.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1e3a5f]">{stat.value}</div>
            </CardContent>
          </Card>
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
