"use client";

/**
 * Audit Log Table Component
 * Displays audit logs in a table format
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Clock, Shield, User, Database, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AuditLogEntry } from "../types";

interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

const actionStyles: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  create: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", glow: "shadow-[0_0_8px_rgba(74,222,128,0.2)]" },
  update: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", glow: "shadow-[0_0_8px_rgba(96,165,250,0.2)]" },
  delete: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", glow: "shadow-[0_0_8px_rgba(248,113,113,0.2)]" },
  login: { color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", glow: "shadow-[0_0_8px_rgba(34,211,238,0.2)]" },
  default: { color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", glow: "" },
};

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), "dd MMM, yyyy • HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const getActionStyle = (action: string) => {
    if (action.includes("create")) return actionStyles.create;
    if (action.includes("update")) return actionStyles.update;
    if (action.includes("delete")) return actionStyles.delete;
    if (action.includes("login")) return actionStyles.login;
    return actionStyles.default;
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Actividad Reciente</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Live Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-green-500 px-3 py-1.5 bg-green-500/5 rounded-xl border border-green-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          SISTEMA OPERATIVO
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.01]">
              <th className="text-left py-5 px-8 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Marca de Tiempo
                </div>
              </th>
              <th className="text-left py-5 px-8 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Acción
                </div>
              </th>
              <th className="text-left py-5 px-8 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" /> Entidad / Objeto
                </div>
              </th>
              <th className="text-left py-5 px-8 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Usuario
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <Activity className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-500 font-bold">No se han detectado logs en este periodo.</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const style = getActionStyle(log.action.toLowerCase());
                return (
                  <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {formatDate(log.createdAt).split(' • ')[0]}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {formatDate(log.createdAt).split(' • ')[1]}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest inline-flex transition-all",
                        style.color, style.bg, style.border, style.glow
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 group-hover:border-cyan-500/20 group-hover:text-cyan-400 transition-all">
                          <Database className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white uppercase tracking-tight leading-tight">{log.entity}</span>
                          <span className="text-[10px] font-mono text-slate-500 mt-0.5">{log.entityId || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                            {log.userId || "SISTEMA"}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-800 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
