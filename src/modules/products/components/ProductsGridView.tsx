'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, GraduationCap, School, Settings, Rocket, Pencil } from 'lucide-react';
import type { ProductTemplate } from '@prisma/client';
import { ProductDeployModal } from './ProductDeployModal';
import { ProductEditModal } from './ProductEditModal';

const iconMap: Record<string, React.ReactNode> = {
  Package: <Package className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  School: <School className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />,
};

interface ProductsGridViewProps {
  products: ProductTemplate[];
}

export function ProductsGridView({ products }: ProductsGridViewProps) {
  const router = useRouter();
  const [deployProduct, setDeployProduct] = useState<ProductTemplate | null>(null);
  const [editProduct, setEditProduct] = useState<ProductTemplate | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
        {products.map((product) => (
          <div
            key={product.id}
            className="glass-card rounded-[2rem] overflow-hidden hover:scale-[1.01] transition-all group"
          >
            {/* Color Preview Bar */}
            <div className="h-2 flex">
              <div className="flex-1" style={{ backgroundColor: product.primaryColor }} />
              <div className="flex-1" style={{ backgroundColor: product.secondaryColor }} />
              <div className="flex-1" style={{ backgroundColor: product.accentColor }} />
            </div>

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: product.primaryColor }}
                  >
                    {iconMap[product.icon] || <Package className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-xs text-slate-400">/{product.slug}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {product.plan}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-slate-400 line-clamp-2">{product.description}</p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {product.domain && (
                  <span className="truncate max-w-[140px]">{product.domain}</span>
                )}
                <span>{product.deployCount} desplegados</span>
                <span>{product.darkMode ? 'Oscuro' : 'Claro'}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeployProduct(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm font-medium"
                >
                  <Rocket className="w-4 h-4" />
                  Desplegar
                </button>
                <button
                  onClick={() => setEditProduct(product)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition-all text-sm"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy Modal */}
      {deployProduct && (
        <ProductDeployModal
          product={deployProduct}
          onClose={() => setDeployProduct(null)}
          onSuccess={() => {
            setDeployProduct(null);
            router.refresh();
          }}
        />
      )}

      {/* Edit Modal */}
      {editProduct && (
        <ProductEditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSuccess={() => {
            setEditProduct(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
