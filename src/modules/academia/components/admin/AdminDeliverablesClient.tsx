"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCohortPicker } from "./AdminCohortPicker";
import { DeliverablesReview } from "../teacher/DeliverablesReview";

const STORAGE_KEY = "kaledacademy_admin_selected_cohort_id";

export function AdminDeliverablesClient() {
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCohortId(stored);
    setHydrated(true);
  }, []);

  const handleCohort = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setCohortId(id);
  }, []);

  if (!hydrated) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-display">Entregables</h1>
          <p className="text-slate-400 mt-1">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Entregables</h1>
        <p className="text-slate-400 mt-1">
          Revisa y aprueba entregables por cohorte. La selección se recuerda en este navegador.
        </p>
      </div>

      <AdminCohortPicker value={cohortId} onChange={handleCohort} />

      <DeliverablesReview cohortId={cohortId} showQueueTabs />
    </div>
  );
}
