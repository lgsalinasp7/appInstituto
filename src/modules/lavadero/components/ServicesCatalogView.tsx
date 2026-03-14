"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { tenantFetch } from "@/lib/tenant-fetch";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export function ServicesCatalogView() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadServices = useCallback(async () => {
    try {
      const res = await tenantFetch("/api/lavadero/services");
      const json = await res.json();
      if (json.success) {
        setServices(json.data.map((s: { id: string; name: string; price: unknown; active: boolean }) => ({ ...s, price: Number(s.price) })));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editingService
        ? `/api/lavadero/services/${editingService.id}`
        : "/api/lavadero/services";
      const method = editingService ? "PUT" : "POST";
      const res = await tenantFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(JSON.stringify(json.error));
      setShowForm(false);
      setEditingService(null);
      setFormData({ name: "", price: "" });
      loadServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: ServiceItem) => {
    try {
      await tenantFetch(`/api/lavadero/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      });
      loadServices();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await tenantFetch(`/api/lavadero/services/${id}`, { method: "DELETE" });
      loadServices();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Servicios</h1>
        <button
          onClick={() => { setEditingService(null); setFormData({ name: "", price: "" }); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
        >
          <Plus size={16} /> Nuevo Servicio
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-5 w-40 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-400">No hay servicios configurados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              className={cn(
                "bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between",
                !s.active && "opacity-50"
              )}
            >
              <div>
                <p className="font-semibold text-slate-900">{s.name}</p>
                <p className="text-sm text-cyan-700 font-bold">${s.price.toLocaleString("es-CO")} COP</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(s)} className="p-1.5 rounded hover:bg-slate-100" title={s.active ? "Desactivar" : "Activar"}>
                  {s.active ? (
                    <ToggleRight size={20} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={20} className="text-slate-400" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingService(s);
                    setFormData({ name: s.name, price: String(s.price) });
                    setShowForm(true);
                  }}
                  className="p-1.5 rounded hover:bg-slate-100"
                >
                  <Edit2 size={14} className="text-slate-500" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-red-50">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h3>
              <button onClick={() => { setShowForm(false); setError(""); }} className="p-1 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Ej: Lavado Completo"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio (COP)*</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                  required
                  min={1}
                  placeholder="25000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Guardando..." : editingService ? "Actualizar" : "Crear Servicio"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
