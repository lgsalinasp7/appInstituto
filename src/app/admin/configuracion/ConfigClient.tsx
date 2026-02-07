"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Settings, ShieldCheck, CreditCard } from "lucide-react";

// Const types pattern (typescript skill)
const TABS = {
  GENERAL: "general",
  ROLES: "roles",
  PLANES: "planes",
} as const;

type TabValue = (typeof TABS)[keyof typeof TABS];

const PLAN_LIMITS = {
  BASICO: { name: "Básico", price: 49, users: 5, students: 100, storage: "1 GB" },
  PROFESIONAL: { name: "Profesional", price: 149, users: 20, students: 500, storage: "10 GB" },
  EMPRESARIAL: { name: "Empresarial", price: 499, users: 100, students: 5000, storage: "100 GB" },
} as const;

interface RoleItem {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

interface ConfigClientProps {
  roles: RoleItem[];
  platformConfig: Record<string, string>;
}

export function ConfigClient({ roles, platformConfig }: ConfigClientProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(TABS.GENERAL);

  const tabs = [
    { key: TABS.GENERAL, label: "General", icon: Settings },
    { key: TABS.ROLES, label: "Roles de Tenant", icon: ShieldCheck },
    { key: TABS.PLANES, label: "Planes", icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800/50 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === TABS.GENERAL ? (
        <GeneralTab config={platformConfig} />
      ) : null}

      {activeTab === TABS.ROLES ? (
        <RolesTab roles={roles} />
      ) : null}

      {activeTab === TABS.PLANES ? (
        <PlanesTab />
      ) : null}
    </div>
  );
}

// ===== General Tab =====
interface GeneralTabProps {
  config: Record<string, string>;
}

function GeneralTab({ config }: GeneralTabProps) {
  return (
    <div className="glass-card rounded-[2rem] p-8 space-y-6">
      <h3 className="text-xl font-bold text-white">Configuración General</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <ConfigField
          label="Nombre de la Plataforma"
          value={config["platform_name"] ?? "KaledSoft"}
          readOnly
        />
        <ConfigField
          label="Email de Soporte"
          value={config["support_email"] ?? "soporte@kaledsoft.tech"}
          readOnly
        />
        <ConfigField
          label="WhatsApp de Soporte"
          value={config["support_whatsapp"] ?? "No configurado"}
          readOnly
        />
        <ConfigField
          label="Dominio Principal"
          value="kaledsoft.tech"
          readOnly
        />
      </div>
      <p className="text-xs text-slate-500 pt-2">
        Para modificar estos valores, contacta al equipo de desarrollo.
      </p>
    </div>
  );
}

// ===== Roles Tab =====
interface RolesTabProps {
  roles: RoleItem[];
}

function RolesTab({ roles }: RolesTabProps) {
  return (
    <div className="glass-card rounded-[2rem] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Roles de Tenant por Defecto</h3>
        <span className="text-xs text-slate-500">
          {roles.length} roles definidos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Rol
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Descripción
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Permisos
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 pb-3">
                Usuarios
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.id} className="group">
                  <td className="py-4 pr-4">
                    <span className="text-sm font-semibold text-white">{role.name}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm text-slate-400">{role.description || "—"}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400"
                        >
                          {p}
                        </span>
                      ))}
                      {role.permissions.length > 3 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                          +{role.permissions.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm text-slate-300">{role.usersCount}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                  No hay roles definidos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Planes Tab =====
function PlanesTab() {
  const plans = Object.entries(PLAN_LIMITS);

  return (
    <div className="glass-card rounded-[2rem] p-8 space-y-6">
      <h3 className="text-xl font-bold text-white">Planes Disponibles</h3>
      <p className="text-sm text-slate-400">
        Referencia de los planes actuales y sus límites. Contacta al equipo de desarrollo para
        modificar estos valores.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map(([key, plan]) => (
          <div
            key={key}
            className="rounded-2xl border border-slate-800/50 p-6 space-y-4 hover:border-cyan-500/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white">{plan.name}</h4>
              <span className="text-2xl font-bold text-cyan-400">${plan.price}</span>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
              USD / mes
            </p>
            <div className="space-y-3 pt-2">
              <PlanLimit label="Usuarios" value={plan.users.toString()} />
              <PlanLimit label="Estudiantes" value={plan.students.toLocaleString()} />
              <PlanLimit label="Almacenamiento" value={plan.storage} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Helper Components =====
interface ConfigFieldProps {
  label: string;
  value: string;
  readOnly?: boolean;
}

function ConfigField({ label, value, readOnly }: ConfigFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        className="w-full h-11 px-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none read-only:opacity-60 read-only:cursor-not-allowed focus:border-cyan-500/50"
      />
    </div>
  );
}

interface PlanLimitProps {
  label: string;
  value: string;
}

function PlanLimit({ label, value }: PlanLimitProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}
