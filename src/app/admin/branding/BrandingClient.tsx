"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Palette, Save, RefreshCw } from "lucide-react";

interface TenantOption {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface BrandingData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  loginBgGradient: string;
  customCss: string;
  darkMode: boolean;
}

interface BrandingClientProps {
  tenants: TenantOption[];
}

const DEFAULT_BRANDING: BrandingData = {
  primaryColor: "#1e3a5f",
  secondaryColor: "#3b82f6",
  accentColor: "#10b981",
  fontFamily: "Inter",
  logoUrl: "",
  faviconUrl: "",
  footerText: "",
  loginBgGradient: "",
  customCss: "",
  darkMode: false,
};

export function BrandingClient({ tenants }: BrandingClientProps) {
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [branding, setBranding] = useState<BrandingData>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const loadBranding = async (tenantId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/branding`);
      if (!res.ok) throw new Error("Error cargando branding");
      const data = await res.json();
      const b = data.branding;
      setBranding({
        primaryColor: b?.primaryColor ?? DEFAULT_BRANDING.primaryColor,
        secondaryColor: b?.secondaryColor ?? DEFAULT_BRANDING.secondaryColor,
        accentColor: b?.accentColor ?? DEFAULT_BRANDING.accentColor,
        fontFamily: b?.fontFamily ?? DEFAULT_BRANDING.fontFamily,
        logoUrl: b?.logoUrl ?? "",
        faviconUrl: b?.faviconUrl ?? "",
        footerText: b?.footerText ?? "",
        loginBgGradient: b?.loginBgGradient ?? "",
        customCss: b?.customCss ?? "",
        darkMode: b?.darkMode ?? false,
      });
    } catch {
      toast.error("Error al cargar el branding");
      setBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (tenantId) {
      loadBranding(tenantId);
    } else {
      setBranding(DEFAULT_BRANDING);
    }
  };

  const handleSave = async () => {
    if (!selectedTenantId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tenants/${selectedTenantId}/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });
      if (!res.ok) throw new Error("Error guardando branding");
      toast.success("Branding actualizado correctamente");
    } catch {
      toast.error("Error al guardar el branding");
    } finally {
      setSaving(false);
    }
  };

  // functional setState (rerender-functional-setstate)
  const updateField = (field: keyof BrandingData, value: string | boolean) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Form Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tenant Selector */}
        <div className="glass-card rounded-[2rem] p-8">
          <h3 className="text-lg font-bold text-white mb-4">Seleccionar Empresa</h3>
          <select
            value={selectedTenantId}
            onChange={(e) => handleTenantChange(e.target.value)}
            className="w-full h-12 px-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="">-- Selecciona una empresa --</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.slug}.kaledsoft.tech) - {t.status}
              </option>
            ))}
          </select>
        </div>

        {/* Branding Form */}
        {selectedTenantId ? (
          <div className="glass-card rounded-[2rem] p-8 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="ml-3 text-slate-400">Cargando branding...</span>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white">Colores</h3>
                <div className="grid grid-cols-3 gap-4">
                  <ColorField
                    label="Primario"
                    value={branding.primaryColor}
                    onChange={(v) => updateField("primaryColor", v)}
                  />
                  <ColorField
                    label="Secundario"
                    value={branding.secondaryColor}
                    onChange={(v) => updateField("secondaryColor", v)}
                  />
                  <ColorField
                    label="Acento"
                    value={branding.accentColor}
                    onChange={(v) => updateField("accentColor", v)}
                  />
                </div>

                <h3 className="text-lg font-bold text-white pt-4">Tipografía y Assets</h3>
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Fuente"
                    value={branding.fontFamily}
                    onChange={(v) => updateField("fontFamily", v)}
                    placeholder="Inter, Roboto..."
                  />
                  <TextField
                    label="Logo URL"
                    value={branding.logoUrl}
                    onChange={(v) => updateField("logoUrl", v)}
                    placeholder="https://..."
                  />
                  <TextField
                    label="Favicon URL"
                    value={branding.faviconUrl}
                    onChange={(v) => updateField("faviconUrl", v)}
                    placeholder="https://..."
                  />
                  <TextField
                    label="Texto Footer"
                    value={branding.footerText}
                    onChange={(v) => updateField("footerText", v)}
                    placeholder="© 2026 Mi Empresa"
                  />
                </div>

                <h3 className="text-lg font-bold text-white pt-4">Opciones</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={branding.darkMode}
                    onChange={(e) => updateField("darkMode", e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
                  />
                  <label htmlFor="darkMode" className="text-sm text-slate-300">
                    Modo oscuro habilitado
                  </label>
                </div>

                {/* Save button */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Guardando..." : "Guardar Branding"}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Preview Column */}
      <div className="space-y-6">
        <div className="glass-card rounded-[2rem] p-8">
          <h3 className="text-lg font-bold text-white mb-4">Vista Previa</h3>

          {selectedTenant ? (
            <div
              className="rounded-2xl border border-slate-800/50 p-6 space-y-4"
              style={{
                fontFamily: branding.fontFamily || "Inter",
              }}
            >
              {/* Preview Card */}
              <div
                className="h-3 rounded-full"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <p className="text-sm font-bold" style={{ color: branding.primaryColor }}>
                {selectedTenant.name}
              </p>
              <p className="text-xs text-slate-400">
                {selectedTenant.slug}.kaledsoft.tech
              </p>
              <div className="flex gap-2 pt-2">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: branding.secondaryColor }}
                />
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: branding.accentColor }}
                />
              </div>
              <p className="text-[10px] text-slate-500 pt-2">
                {branding.footerText || "Sin texto de footer"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Palette className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">
                Selecciona una empresa para ver la vista previa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 px-3 bg-slate-900/50 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none focus:border-cyan-500/50"
        />
      </div>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 bg-slate-900/50 border border-slate-800 rounded-lg text-sm text-slate-300 outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
      />
    </div>
  );
}
