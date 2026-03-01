'use client';

import { useState } from 'react';
import { X, Rocket, Copy, Check, Loader2 } from 'lucide-react';
import type { ProductTemplate } from '@prisma/client';
import { toast } from 'sonner';

interface ProductDeployModalProps {
  product: ProductTemplate;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductDeployModal({ product, onClose, onSuccess }: ProductDeployModalProps) {
  const [form, setForm] = useState({
    tenantName: '',
    tenantSlug: '',
    adminEmail: product.adminEmail || '',
    adminName: product.adminName || '',
    adminPassword: '',
    autoGeneratePassword: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ generatedPassword?: string; tenantSlug: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm((prev) => ({ ...prev, tenantName: name, tenantSlug: slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al desplegar');
      }

      setResult(data.data);
      toast.success(`Tenant "${form.tenantName}" desplegado exitosamente`);
    } catch (error: any) {
      toast.error(error.message || 'Error al desplegar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-[2rem] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: product.primaryColor }}
            >
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Desplegar {product.name}</h2>
              <p className="text-xs text-slate-400">Crear un nuevo tenant desde esta plantilla</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {result ? (
            // Success view
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 font-medium">Tenant desplegado exitosamente</p>
                <p className="text-sm text-slate-400 mt-1">
                  Slug: <span className="text-white font-mono">{result.tenantSlug}</span>
                </p>
              </div>

              {result.generatedPassword && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <p className="text-amber-400 font-medium text-sm">Contraseña generada (guardar ahora):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-lg bg-black/30 text-white font-mono text-sm">
                      {result.generatedPassword}
                    </code>
                    <button
                      onClick={() => handleCopy(result.generatedPassword!)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={onSuccess}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            // Form view
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Nombre del tenant</label>
                <input
                  type="text"
                  value={form.tenantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="Mi Instituto"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Slug (URL)</label>
                <input
                  type="text"
                  value={form.tenantSlug}
                  onChange={(e) => setForm((prev) => ({ ...prev, tenantSlug: e.target.value }))}
                  required
                  pattern="^[a-z0-9-]+$"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono"
                  placeholder="mi-instituto"
                />
                <p className="text-xs text-slate-500 mt-1">{form.tenantSlug}.kaledsoft.tech</p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email del administrador</label>
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="admin@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Nombre del administrador</label>
                <input
                  type="text"
                  value={form.adminName}
                  onChange={(e) => setForm((prev) => ({ ...prev, adminName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="Nombre del admin"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoPassword"
                  checked={form.autoGeneratePassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, autoGeneratePassword: e.target.checked, adminPassword: '' }))}
                  className="rounded"
                />
                <label htmlFor="autoPassword" className="text-sm text-slate-400">
                  Generar contraseña automáticamente
                </label>
              </div>

              {!form.autoGeneratePassword && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={form.adminPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
                    required={!form.autoGeneratePassword}
                    minLength={8}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              )}

              {/* Pre-filled template info */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-slate-500 space-y-1">
                <p>Plan: <span className="text-slate-300">{product.plan}</span></p>
                {product.domain && <p>Dominio base: <span className="text-slate-300">{product.domain}</span></p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Desplegando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Desplegar Tenant
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
