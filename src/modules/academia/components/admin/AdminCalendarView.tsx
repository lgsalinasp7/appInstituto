"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tenantFetch } from "@/lib/tenant-fetch";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CalendarEvent {
  id: string;
  cohortId: string;
  cohortName: string;
  courseId: string;
  courseTitle: string;
  title: string;
  type: string;
  scheduledAt: string | null;
  startTime: string | null;
  endTime: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  sessionOrder: number;
  cancelled: boolean;
  deliveredAt: string | null;
  deliveredByName: string | null;
}

interface CourseOption {
  id: string;
  title: string;
}

interface CohortOption {
  id: string;
  name: string;
  courseId: string;
  course: { id: string; title: string };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type EventStatus = "scheduled" | "delivered" | "cancelled";

function getEventStatus(ev: CalendarEvent): EventStatus {
  if (ev.cancelled) return "cancelled";
  if (ev.deliveredAt) return "delivered";
  return "scheduled";
}

const STATUS_DOT: Record<EventStatus, string> = {
  scheduled: "bg-blue-400",
  delivered: "bg-emerald-400",
  cancelled: "bg-slate-500",
};

const STATUS_BADGE: Record<EventStatus, string> = {
  scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const STATUS_LABEL: Record<EventStatus, string> = {
  scheduled: "Programada",
  delivered: "Impartida",
  cancelled: "Cancelada",
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function AdminCalendarView() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);

  // Filters
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [cohortId, setCohortId] = useState("");

  // Events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load filter options
  useEffect(() => {
    (async () => {
      const [cRes, chRes] = await Promise.all([
        tenantFetch("/api/academy/courses"),
        tenantFetch("/api/academy/cohorts"),
      ]);
      const cJson = await cRes.json();
      const chJson = await chRes.json();
      if (cRes.ok && cJson.success) setCourses(cJson.data ?? []);
      if (chRes.ok && chJson.success) setCohorts(chJson.data ?? []);
    })();
  }, []);

  const filteredCohorts = courseId
    ? cohorts.filter((c) => c.courseId === courseId || c.course?.id === courseId)
    : cohorts;

  // Load events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (cohortId) params.set("cohortId", cohortId);
    const res = await tenantFetch(`/api/academy/admin/calendar?${params}`);
    const json = await res.json();
    if (res.ok && json.success) {
      setEvents(json.data ?? []);
    }
    setLoading(false);
  }, [courseId, cohortId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- triggers async data load; setState is inside loadEvents intentionally
    void loadEvents();
  }, [loadEvents]);

  // Calendar math
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeek(viewYear, viewMonth);
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  function getEventsForDay(day: number): CalendarEvent[] {
    const date = new Date(viewYear, viewMonth, day);
    return events.filter((e) => {
      if (!e.scheduledAt) return false;
      return isSameDay(new Date(e.scheduledAt), date);
    });
  }

  const selectedDayEvents = selected
    ? events.filter((e) => e.scheduledAt && isSameDay(new Date(e.scheduledAt), selected))
    : [];

  // Mark delivery
  const toggleDelivery = async (eventId: string, evCohortId: string, delivered: boolean) => {
    const res = await tenantFetch(
      `/api/academy/cohorts/${evCohortId}/events/${eventId}/delivery`,
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
    await loadEvents();
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full space-y-6"
    >
      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Curso
          </label>
          <select
            value={courseId}
            onChange={(e) => { setCourseId(e.target.value); setCohortId(""); }}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 min-w-[200px]"
          >
            <option value="">Todos los cursos</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Cohorte
          </label>
          <select
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 min-w-[200px]"
          >
            <option value="">Todos los cohortes</option>
            {filteredCohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendar grid */}
        <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-white font-display">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const dayNum = idx - firstDayOffset + 1;
              const isValid = dayNum >= 1 && dayNum <= daysInMonth;
              const cellDate = isValid ? new Date(viewYear, viewMonth, dayNum) : null;
              const isToday = cellDate ? isSameDay(cellDate, today) : false;
              const isSelected = selected && cellDate ? isSameDay(cellDate, selected) : false;
              const dayEvents = isValid ? getEventsForDay(dayNum) : [];

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isValid}
                  onClick={() => cellDate && setSelected(isSelected ? null : cellDate)}
                  className={cn(
                    "min-h-[52px] rounded-xl p-1.5 flex flex-col items-start gap-0.5 transition-colors",
                    !isValid && "opacity-0 pointer-events-none",
                    isValid && !isSelected && "hover:bg-white/[0.04]",
                    isSelected && "bg-cyan-500/10 border border-cyan-500/20",
                    isToday && !isSelected && "border border-white/10"
                  )}
                >
                  {isValid && (
                    <>
                      <span className={cn(
                        "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                        isToday ? "bg-cyan-500 text-white" : "text-slate-300"
                      )}>
                        {dayNum}
                      </span>
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 4).map((e) => (
                          <span
                            key={e.id}
                            className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[getEventStatus(e)])}
                          />
                        ))}
                        {dayEvents.length > 4 && (
                          <span className="text-[9px] text-slate-400 leading-none">+{dayEvents.length - 4}</span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {loading && (
            <p className="text-center text-sm text-slate-500 mt-4">Cargando eventos…</p>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-white/[0.06]">
            {(Object.entries(STATUS_LABEL) as [EventStatus, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[key])} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.div variants={fadeUp} className="space-y-4">
          {selected ? (
            <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white font-display">
                  {selected.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-slate-500">Sin sesiones este día.</p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {selectedDayEvents.map((ev) => {
                    const status = getEventStatus(ev);
                    return (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl border border-white/[0.06] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{ev.title}</p>
                            <p className="text-xs text-slate-400 truncate">{ev.cohortName} · {ev.courseTitle}</p>
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                            STATUS_BADGE[status]
                          )}>
                            {STATUS_LABEL[status]}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          {ev.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}
                            </span>
                          )}
                          {ev.lessonTitle && (
                            <span className="flex items-center gap-1">
                              <BookOpen size={11} />
                              {ev.lessonTitle}
                            </span>
                          )}
                        </div>

                        {ev.deliveredAt && ev.deliveredByName && (
                          <p className="text-[11px] text-emerald-400/70">
                            Impartida por {ev.deliveredByName} · {new Date(ev.deliveredAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                          </p>
                        )}

                        {/* Quick action */}
                        {!ev.cancelled && ev.lessonId && !ev.deliveredAt && (
                          <button
                            type="button"
                            onClick={() => void toggleDelivery(ev.id, ev.cohortId, true)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                          >
                            <CheckCircle2 size={13} />
                            Marcar impartida
                          </button>
                        )}
                        {ev.cancelled && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Ban size={11} /> Cancelada
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Haz clic en un día para ver las sesiones programadas.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="academy-card-dark rounded-xl sm:rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Resumen</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-lg font-black text-white">{events.filter((e) => !e.cancelled && !e.deliveredAt).length}</p>
                <p className="text-[10px] text-blue-400">Programadas</p>
              </div>
              <div>
                <p className="text-lg font-black text-white">{events.filter((e) => e.deliveredAt).length}</p>
                <p className="text-[10px] text-emerald-400">Impartidas</p>
              </div>
              <div>
                <p className="text-lg font-black text-white">{events.filter((e) => e.cancelled).length}</p>
                <p className="text-[10px] text-slate-400">Canceladas</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
