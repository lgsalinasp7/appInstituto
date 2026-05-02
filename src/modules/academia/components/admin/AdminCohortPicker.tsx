"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export type AdminCohortOption = {
  id: string;
  name: string;
  course?: { title: string };
};

interface AdminCohortPickerProps {
  value: string | null;
  onChange: (cohortId: string) => void;
  label?: string;
  className?: string;
}

export function AdminCohortPicker({
  value,
  onChange,
  label = "Cohorte",
  className = "",
}: AdminCohortPickerProps) {
  const [cohorts, setCohorts] = useState<AdminCohortOption[]>([]);
  const [loading, setLoading] = useState(true);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/academy/cohorts", { credentials: "include" })
      .then((r) => r.json())
      .then((res: { success?: boolean; data?: AdminCohortOption[] }) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setCohorts(list);
        if (list.length === 0) return;
        const v = valueRef.current;
        if (list.length === 1) {
          onChange(list[0].id);
          return;
        }
        if (v && !list.some((c) => c.id === v)) {
          onChange(list[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setCohorts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [onChange]);

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
    },
    [onChange]
  );

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-slate-400 text-sm ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando cohortes…
      </div>
    );
  }

  if (cohorts.length === 0) {
    return (
      <p className={`text-sm text-amber-400/90 ${className}`}>
        No hay cohortes en este tenant. Crea uno desde Cohortes.
      </p>
    );
  }

  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {label}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => handleSelect(e.target.value)}
        className="w-full max-w-md rounded-xl border border-white/[0.12] bg-white/[0.04] text-white text-sm px-4 py-2.5 outline-none focus:border-cyan-500/40"
      >
        <option value="" disabled>
          Seleccionar cohorte…
        </option>
        {cohorts.map((c) => (
          <option key={c.id} value={c.id} className="bg-slate-900">
            {c.name}
            {c.course?.title ? ` · ${c.course.title}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
