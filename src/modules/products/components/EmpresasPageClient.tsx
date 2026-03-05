'use client';

import { useState } from 'react';
import { TenantsListView } from '@/modules/tenants/components/TenantsListView';
import { ProductsGridView } from './ProductsGridView';
import { ConfigClient } from '@/app/admin/configuracion/ConfigClient';
import type { Tenant } from '@/modules/tenants/types';
import type { ProductTemplate } from '@prisma/client';

interface ConfigRoleItem {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

interface EmpresasPageClientProps {
  tenants: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    status: string;
    plan: string;
  };
  products: ProductTemplate[];
  configData?: {
    roles: ConfigRoleItem[];
    platformConfig: Record<string, string>;
  };
}

export function EmpresasPageClient({
  tenants,
  pagination,
  filters,
  products,
  configData,
}: EmpresasPageClientProps) {
  const [activeTab, setActiveTab] = useState<'empresas' | 'productos' | 'configuracion'>('empresas');

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-2xl glass-card w-fit">
        <button
          onClick={() => setActiveTab('empresas')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'empresas'
              ? 'bg-blue-500/20 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Empresas ({pagination.total})
        </button>
        <button
          onClick={() => setActiveTab('productos')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'productos'
              ? 'bg-blue-500/20 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Productos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('configuracion')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'configuracion'
              ? 'bg-blue-500/20 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Configuración
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'empresas' && (
        <TenantsListView
          tenants={tenants}
          pagination={pagination}
          filters={filters}
        />
      )}
      {activeTab === 'productos' && (
        <ProductsGridView products={products} />
      )}
      {activeTab === 'configuracion' && configData && (
        <ConfigClient roles={configData.roles} platformConfig={configData.platformConfig} />
      )}
      {activeTab === 'configuracion' && !configData && (
        <div className="glass-card rounded-2xl p-8 text-slate-400 text-sm">
          Cargando configuración…
        </div>
      )}
    </div>
  );
}
