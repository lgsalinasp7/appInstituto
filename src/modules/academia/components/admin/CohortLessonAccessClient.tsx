"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isLessonPrecohortMeta } from "@/modules/academia/services/academy-cohort-lesson-access.service";

interface LessonRow {
  id: string;
  title: string;
  order: number;
  meta: { weekNumber: number; dayOfWeek: string; isPrecohort?: boolean } | null;
}

interface ModuleRow {
  id: string;
  title: string;
  order: number;
  lessons: LessonRow[];
}

interface AccessPayload {
  cohortId: string;
  lessonGatingEnabled: boolean;
  timezone: string | null;
  releasedLessonIds: string[];
  modules: ModuleRow[];
}

interface CohortEventRow {
  id: string;
  title: string;
  type: string;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  scheduledAt: Date | string | null;
  lessonId: string | null;
  sessionOrder: number;
  cancelled: boolean;
}

export function CohortLessonAccessClient() {
  const params = useParams();
  const cohortId = params.cohortId as string;

  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessPayload | null>(null);
  const [events, setEvents] = useState<CohortEventRow[]>([]);
  const [gatingEnabled, setGatingEnabled] = useState(false);
  const [released, setReleased] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const flatLessons = useMemo(() => {
    if (!access) return [];
    return access.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleOrder: m.order }))
    );
  }, [access]);

  const reloadEventsOnly = useCallback(async () => {
    const eRes = await fetch(`/api/academy/cohorts/${cohortId}/events`);
    const eJson = await eRes.json();
    if (eRes.ok && eJson.success) {
      setEvents(eJson.data as CohortEventRow[]);
    }
  }, [cohortId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, eRes] = await Promise.all([
        fetch(`/api/academy/cohorts/${cohortId}/lesson-access`),
        fetch(`/api/academy/cohorts/${cohortId}/events`),
      ]);
      const aJson = await aRes.json();
      const eJson = await eRes.json();
      if (!aRes.ok || !aJson.success) {
        toast.error(aJson.error || "No se pudo cargar el cohorte");
        setAccess(null);
        return;
      }
      setAccess(aJson.data);
      setGatingEnabled(aJson.data.lessonGatingEnabled);
      setReleased(new Set(aJson.data.releasedLessonIds as string[]));
      if (eRes.ok && eJson.success) {
        setEvents(eJson.data as CohortEventRow[]);
      } else {
        setEvents([]);
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setLoading(false);
    }
  }, [cohortId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleLesson = (lessonId: string, isPrecohort: boolean) => {
    if (isPrecohort) return;
    setReleased((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const saveAccess = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/academy/cohorts/${cohortId}/lesson-access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonGatingEnabled: gatingEnabled,
          releasedLessonIds: Array.from(released),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "No se pudo guardar");
        return;
      }
      toast.success("Cambios guardados");
      await load();
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const saveEventPatch = async (
    eventId: string,
    patch: Partial<{
      lessonId: string | null;
      scheduledAt: string | null;
      sessionOrder: number;
      cancelled: boolean;
    }>
  ) => {
    try {
      const res = await fetch(`/api/academy/cohorts/${cohortId}/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "No se pudo actualizar el evento");
        return;
      }
      toast.success("Evento actualizado");
      await reloadEventsOnly();
    } catch {
      toast.error("Error de red");
    }
  };

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <p className="text-slate-400">Cargando…</p>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="academy-card-dark p-8">
        <p className="text-red-400">Cohorte no encontrado o sin permiso.</p>
        <Link href="/academia/admin/cohorts" className="mt-4 inline-block text-cyan-400 hover:underline">
          Volver a cohortes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display tracking-tight">
            Lecciones por cohorte
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Activa el control por cohorte y marca qué lecciones están liberadas. Las marcadas como
            pre-cohorte en el curso son siempre visibles cuando el gating está activo.
          </p>
        </div>
        <Link href="/academia/admin/cohorts" className="text-sm text-cyan-400 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="academy-card-dark p-6 rounded-xl border border-white/[0.08] space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={gatingEnabled}
            onChange={(e) => setGatingEnabled(e.target.checked)}
            className="rounded border-white/20"
          />
          <span className="text-white font-semibold">Activar liberación progresiva por cohorte</span>
        </label>

        <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2">
          {access.modules.map((mod) => (
            <div key={mod.id}>
              <h3 className="text-sm font-bold text-cyan-400 mb-2">
                Módulo {mod.order}: {mod.title}
              </h3>
              <ul className="space-y-2">
                {mod.lessons.map((lesson) => {
                  const precohort = isLessonPrecohortMeta(lesson.meta ?? undefined);
                  const checked = precohort || released.has(lesson.id);
                  return (
                    <li
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2",
                        precohort && "bg-white/[0.03]"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={precohort || !gatingEnabled}
                        onChange={() => toggleLesson(lesson.id, precohort)}
                        className="rounded border-white/20"
                      />
                      <span className="text-sm text-slate-200 flex-1">
                        {lesson.title}
                        <span className="text-slate-500 ml-2 text-xs">
                          S{lesson.meta?.weekNumber ?? "—"} · {lesson.meta?.dayOfWeek ?? ""}
                          {precohort ? " · pre-cohorte" : ""}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void saveAccess()}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar lecciones liberadas"}
        </button>
      </div>

      <div className="academy-card-dark p-6 rounded-xl border border-white/[0.08] space-y-4">
        <h2 className="text-lg font-bold text-white font-display">Sesiones en vivo (calendario)</h2>
        <p className="text-xs text-slate-500">
          Vincula cada evento a una lección, ajusta orden, fecha u oculta cancelados. Guardar fila a
          fila.
        </p>
        {events.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay eventos en este cohorte.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-500">
                  <th className="py-2 pr-2">Título</th>
                  <th className="py-2 pr-2">Lección</th>
                  <th className="py-2 pr-2">Orden</th>
                  <th className="py-2 pr-2">Inicio (local)</th>
                  <th className="py-2 pr-2">Cancelado</th>
                  <th className="py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <EventEditorRow
                    key={ev.id}
                    ev={ev}
                    lessons={flatLessons}
                    onSave={(patch) => void saveEventPatch(ev.id, patch)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EventEditorRow({
  ev,
  lessons,
  onSave,
}: {
  ev: CohortEventRow;
  lessons: Array<LessonRow & { moduleTitle: string; moduleOrder: number }>;
  onSave: (patch: {
    lessonId: string | null;
    scheduledAt: string | null;
    sessionOrder: number;
    cancelled: boolean;
  }) => void;
}) {
  const [lessonId, setLessonId] = useState(ev.lessonId ?? "");
  const [sessionOrder, setSessionOrder] = useState(ev.sessionOrder);
  const [cancelled, setCancelled] = useState(ev.cancelled);
  const [scheduledLocal, setScheduledLocal] = useState(() => {
    if (!ev.scheduledAt) return "";
    const d = new Date(ev.scheduledAt);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  return (
    <tr className="border-b border-white/[0.06] align-top">
      <td className="py-2 pr-2 text-white">{ev.title}</td>
      <td className="py-2 pr-2">
        <select
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className="w-full max-w-[200px] rounded bg-white/5 border border-white/10 px-2 py-1 text-xs"
        >
          <option value="">— Sin lección —</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              M{l.moduleOrder} · {l.title.slice(0, 40)}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-2">
        <input
          type="number"
          min={0}
          value={sessionOrder}
          onChange={(e) => setSessionOrder(Number(e.target.value))}
          className="w-16 rounded bg-white/5 border border-white/10 px-2 py-1 text-xs"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="datetime-local"
          value={scheduledLocal}
          onChange={(e) => setScheduledLocal(e.target.value)}
          className="rounded bg-white/5 border border-white/10 px-2 py-1 text-xs"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="checkbox"
          checked={cancelled}
          onChange={(e) => setCancelled(e.target.checked)}
          className="rounded border-white/20"
        />
      </td>
      <td className="py-2">
        <button
          type="button"
          onClick={() =>
            onSave({
              lessonId: lessonId || null,
              sessionOrder,
              cancelled,
              scheduledAt: scheduledLocal ? new Date(scheduledLocal).toISOString() : null,
            })
          }
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
        >
          Guardar
        </button>
      </td>
    </tr>
  );
}
