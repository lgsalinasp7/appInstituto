import type { Metadata } from "next";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { FreeTierReferenceTable } from "./FreeTierReferenceTable";
import { UsageProfilesTable } from "./UsageProfilesTable";
import modelsData from "@/data/ai-models-free-tier.json";

export const metadata: Metadata = {
  title: "Referencia Free Tier | Admin KaledSoft",
  description: "Tabla de referencia de límites gratuitos de proveedores de IA",
};

export default function ReferenciaPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Referencia"
        titleHighlight="Free Tier"
        subtitle="Límites gratuitos y perfiles de uso de proveedores de IA"
      />

      {/* Alerta de Cambio Temporal */}
      <div className="glass-card rounded-[2rem] p-6 border-2 border-yellow-500/30 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">
              Cambio Temporal de Modelo
            </h3>
            <p className="text-sm text-slate-300">
              Se cambió temporalmente de <strong>Google Gemini 2.0 Flash</strong> a{" "}
              <strong className="text-yellow-400">Groq (Llama 3.3 70B)</strong> debido a problemas
              de cuota con la API key de Google. Una vez resuelta la API key, se volverá a Gemini
              que ofrece mejor free tier (250M tokens/mes vs 15M tokens/día).
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de Modelo Actual */}
      <div className="glass-card rounded-[2rem] p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          🟢 Modelo Actual en Uso
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-slate-400">Proveedor</p>
            <p className="text-lg font-semibold text-white">Groq</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Modelo</p>
            <p className="text-lg font-semibold text-yellow-400">Llama 3.3 70B Versatile</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Free Tier</p>
            <p className="text-lg font-semibold text-green-400">15M tokens/día (450M/mes)</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Renovación</p>
            <p className="text-lg font-semibold text-cyan-400">Diaria</p>
          </div>
        </div>
      </div>

      {/* Tabla de Free Tiers */}
      <FreeTierReferenceTable models={modelsData.models} />

      {/* Tabla de Perfiles de Uso */}
      <UsageProfilesTable
        profiles={modelsData.usageProfiles}
        models={modelsData.models}
      />
    </div>
  );
}
