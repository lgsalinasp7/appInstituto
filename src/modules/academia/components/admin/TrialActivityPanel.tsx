"use client";

import { useEffect, useState } from "react";
import { Sparkles, MessageCircle, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ACTION_LABELS: Record<string, string> = {
  PAGE_VIEW: "Vista de página",
  DASHBOARD_VIEW: "Dashboard",
  LESSON_VIEW: "Vista de lección",
  CLICK_CONTACT: "Clic en Contáctanos",
};

type TrialPanelProps = {
  /** En contexto de pestaña no repetimos el H1 de página completa */
  compact?: boolean;
};

export function TrialActivityPanel({ compact }: TrialPanelProps) {
  const [data, setData] = useState<{
    trialUsers: Array<{
      id: string;
      name: string | null;
      email: string;
      trialExpiresAt: string | null;
    }>;
    activities: Array<{
      id: string;
      userId: string;
      userName: string | null;
      userEmail: string;
      action: string;
      entityType: string | null;
      entityId: string | null;
      metadata: unknown;
      createdAt: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/trial/activity")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const trialUsers = data?.trialUsers ?? [];
  const activities = data?.activities ?? [];

  return (
    <div className="space-y-8">
      {!compact && (
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            Usuarios de prueba
          </h1>
          <p className="text-slate-400 mt-1">
            Lista de usuarios con acceso trial y registro de actividad.
          </p>
        </div>
      )}

      {compact && (
        <p className="text-slate-400 text-sm">
          Usuarios con acceso trial y su actividad reciente en el producto.
        </p>
      )}

      <div className="academy-card-dark p-6 rounded-xl border border-white/[0.08]">
        <h2 className="text-lg font-bold text-white mb-4">Usuarios con acceso de prueba</h2>
        {trialUsers.length === 0 ? (
          <p className="text-slate-500">No hay usuarios de prueba activos.</p>
        ) : (
          <div className="space-y-2">
            {trialUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div>
                  <p className="font-semibold text-white">{u.name || u.email}</p>
                  <p className="text-sm text-slate-400">{u.email}</p>
                </div>
                <span className="text-xs text-slate-500">
                  Expira:{" "}
                  {u.trialExpiresAt
                    ? format(new Date(u.trialExpiresAt), "dd MMM yyyy", { locale: es })
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="academy-card-dark p-6 rounded-xl border border-white/[0.08]">
        <h2 className="text-lg font-bold text-white mb-4">Actividad reciente</h2>
        {activities.length === 0 ? (
          <p className="text-slate-500">No hay actividad registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Usuario
                  </th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Acción
                  </th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr
                    key={a.id}
                    className={`border-b border-white/[0.04] ${
                      a.action === "CLICK_CONTACT"
                        ? "bg-amber-500/5 border-l-4 border-l-amber-500"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-white">{a.userName || a.userEmail}</p>
                        <p className="text-xs text-slate-500">{a.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          a.action === "CLICK_CONTACT"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800/50 text-slate-400"
                        }`}
                      >
                        {a.action === "CLICK_CONTACT" ? (
                          <MessageCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        {ACTION_LABELS[a.action] ?? a.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {format(new Date(a.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
