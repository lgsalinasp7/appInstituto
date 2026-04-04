"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isLessonPrecohortMeta } from "@/modules/academia/utils/is-lesson-precohort-meta";

/** Native select dropdowns use OS chrome; without this, Windows often shows white list + inherited white text. */
const academyNativeSelectClass =
  "rounded border border-white/10 bg-white/5 text-slate-100 [color-scheme:dark]";
const academyNativeOptionClass = "bg-slate-900 text-slate-100";

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
  cohortName: string;
  courseTitle: string;
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
  deliveredAt: string | null;
  deliveredByUserId: string | null;
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
  const [showNewForm, setShowNewForm] = useState(false);

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
      const payload = aJson.data as AccessPayload;
      setAccess(payload);
      setGatingEnabled(payload.lessonGatingEnabled);
      setReleased(new Set(payload.releasedLessonIds));
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

  const toggleDelivery = async (eventId: string, delivered: boolean) => {
    try {
      const res = await fetch(
        `/api/academy/cohorts/${cohortId}/events/${eventId}/delivery`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivered }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "No se pudo actualizar la constancia");
        return;
      }
      toast.success(delivered ? "Sesión marcada como impartida" : "Constancia revertida");
      await reloadEventsOnly();
    } catch {
      toast.error("Error de red");
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

  const createEvent = async (data: {
    title: string;
    type: string;
    lessonId?: string;
    scheduledAt?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    try {
      const body: Record<string, unknown> = {
        title: data.title,
        type: data.type,
        sessionOrder: events.length,
      };
      if (data.lessonId) body.lessonId = data.lessonId;
      if (data.scheduledAt) body.scheduledAt = new Date(data.scheduledAt).toISOString();
      if (data.startTime) body.startTime = data.startTime;
      if (data.endTime) body.endTime = data.endTime;

      const res = await fetch(`/api/academy/cohorts/${cohortId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "No se pudo crear el evento");
        return;
      }
      toast.success("Sesión creada");
      setShowNewForm(false);
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
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-1">
            Cohorte actual
          </p>
          <h1 className="text-2xl font-black text-white font-display tracking-tight">
            {access.cohortName}
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">{access.courseTitle}</p>
          <p className="text-sm text-slate-400 mt-3">
            <span className="text-white/90 font-medium">Lecciones y calendario:</span> activa la
            liberación progresiva y marca qué lecciones están liberadas para este cohorte. Las
            marcadas como pre-cohorte en el curso siguen visibles para los estudiantes cuando el
            gating está activo.
          </p>
        </div>
        <Link href="/academia/admin/cohorts" className="text-sm text-cyan-400 hover:underline shrink-0">
          ← Volver a cohortes
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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white font-display">Sesiones en vivo (calendario)</h2>
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
          >
            + Nueva sesión
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Vincula cada evento a una lección, ajusta orden, fecha u oculta cancelados. Guardar fila a
          fila.
        </p>

        {showNewForm && (
          <NewEventForm
            lessons={flatLessons}
            onSubmit={(data) => void createEvent(data)}
            onCancel={() => setShowNewForm(false)}
          />
        )}

        {events.length === 0 && !showNewForm && (
          <p className="text-slate-500 text-sm">No hay eventos en este cohorte.</p>
        )}

        {events.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-500">
                  <th className="py-2 pr-2">Título</th>
                  <th className="py-2 pr-2">Lección</th>
                  <th className="py-2 pr-2">Orden</th>
                  <th className="py-2 pr-2">Inicio (local)</th>
                  <th className="py-2 pr-2">Cancelado</th>
                  <th className="py-2 pr-2">Impartida</th>
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
                    onToggleDelivery={(delivered) => void toggleDelivery(ev.id, delivered)}
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
  onToggleDelivery,
}: {
  ev: CohortEventRow;
  lessons: Array<LessonRow & { moduleTitle: string; moduleOrder: number }>;
  onSave: (patch: {
    lessonId: string | null;
    scheduledAt: string | null;
    sessionOrder: number;
    cancelled: boolean;
  }) => void;
  onToggleDelivery: (delivered: boolean) => void;
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
          className={cn(
            "w-full max-w-[200px] px-2 py-1 text-xs",
            academyNativeSelectClass
          )}
        >
          <option value="" className={academyNativeOptionClass}>
            — Sin lección —
          </option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id} className={academyNativeOptionClass}>
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
      <td className="py-2 pr-2">
        {ev.deliveredAt ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-300">
              {new Date(ev.deliveredAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
            </span>
            <button
              type="button"
              onClick={() => onToggleDelivery(false)}
              className="text-[10px] text-red-400 hover:text-red-300 ml-1"
              title="Revertir constancia"
            >
              ✕
            </button>
          </span>
        ) : ev.cancelled || !ev.lessonId ? (
          <span className="text-xs text-slate-600">—</span>
        ) : (
          <button
            type="button"
            onClick={() => onToggleDelivery(true)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Marcar
          </button>
        )}
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

function NewEventForm({
  lessons,
  onSubmit,
  onCancel,
}: {
  lessons: Array<LessonRow & { moduleTitle: string; moduleOrder: number }>;
  onSubmit: (data: {
    title: string;
    type: string;
    lessonId?: string;
    scheduledAt?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("LIVE");
  const [lessonId, setLessonId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }
    onSubmit({
      title: title.trim(),
      type,
      lessonId: lessonId || undefined,
      scheduledAt: scheduledAt || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    });
  };

  return (
    <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Clase 1 - Introducción"
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white placeholder:text-slate-600"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tipo *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={cn("w-full px-2 py-1.5 text-sm", academyNativeSelectClass)}
          >
            <option value="LIVE" className={academyNativeOptionClass}>
              LIVE
            </option>
            <option value="HANDS_ON" className={academyNativeOptionClass}>
              HANDS_ON
            </option>
            <option value="LECTURE" className={academyNativeOptionClass}>
              LECTURE
            </option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Lección</label>
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className={cn("w-full px-2 py-1.5 text-sm", academyNativeSelectClass)}
          >
            <option value="" className={academyNativeOptionClass}>
              — Sin lección —
            </option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id} className={academyNativeOptionClass}>
                M{l.moduleOrder} · {l.title.slice(0, 40)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Hora inicio (HH:MM)</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Hora fin (HH:MM)</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-300"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          Crear sesión
        </button>
      </div>
    </div>
  );
}
