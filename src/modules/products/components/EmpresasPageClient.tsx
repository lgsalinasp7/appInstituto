'use client';

import { useState } from 'react';
import { TenantsListView } from '@/modules/tenants/components/TenantsListView';
import { ProductsGridView } from './ProductsGridView';
import type { Tenant } from '@/modules/tenants/types';
import type { ProductTemplate } from '@prisma/client';

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
}

export function EmpresasPageClient({
  tenants,
  pagination,
  filters,
  products,
}: EmpresasPageClientProps) {
  const [activeTab, setActiveTab] = useState<'empresas' | 'productos'>('empresas');

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl glass-card w-fit">
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
      </div>

      {/* Tab Content */}
      {activeTab === 'empresas' ? (
        <TenantsListView
          tenants={tenants}
          pagination={pagination}
          filters={filters}
        />
      ) : (
        <ProductsGridView products={products} />
      )}
    </div>
  );
}
