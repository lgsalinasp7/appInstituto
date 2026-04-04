"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  CheckCircle2,
  Unlock,
  Ban,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SessionEvent {
  id: string;
  cohortId: string;
  cohortName: string;
  courseTitle: string;
  title: string;
  type: string;
  scheduledAt: string | null;
  startTime: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  cancelled: boolean;
  deliveredAt: string | null;
}

export interface StudentCalendarProps {
  events: SessionEvent[];
  releasedByCohort: Record<string, string[]>;
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

type EventColor = "scheduled" | "delivered" | "released" | "cancelled";

function getEventColor(
  ev: SessionEvent,
  releasedByCohort: Record<string, string[]>
): EventColor {
  if (ev.cancelled) return "cancelled";
  if (ev.deliveredAt) return "delivered";
  if (ev.lessonId && releasedByCohort[ev.cohortId]?.includes(ev.lessonId)) return "released";
  return "scheduled";
}

const COLOR_DOT: Record<EventColor, string> = {
  scheduled: "bg-blue-400",
  delivered: "bg-emerald-400",
  released: "bg-orange-400",
  cancelled: "bg-slate-500",
};

const COLOR_BADGE: Record<EventColor, string> = {
  scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  released: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const COLOR_LABEL: Record<EventColor, string> = {
  scheduled: "Programada",
  delivered: "Impartida",
  released: "Material liberado",
  cancelled: "Cancelada",
};

const COLOR_ICON: Record<EventColor, React.ReactNode> = {
  scheduled: <Circle size={11} />,
  delivered: <CheckCircle2 size={11} />,
  released: <Unlock size={11} />,
  cancelled: <Ban size={11} />,
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CalendarView({ events, releasedByCohort }: StudentCalendarProps) {
  const [selected, setSelected] = useState<Date | null>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeek(viewYear, viewMonth);
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

  function getEventsForDay(day: number): SessionEvent[] {
    const date = new Date(viewYear, viewMonth, day);
    return events.filter((e) => {
      if (!e.scheduledAt) return false;
      return isSameDay(new Date(e.scheduledAt), date);
    });
  }

  const selectedDayEvents = selected
    ? events.filter((e) => e.scheduledAt && isSameDay(new Date(e.scheduledAt), selected))
    : [];

  // Stats
  const scheduled = events.filter((e) => !e.cancelled && !e.deliveredAt).length;
  const delivered = events.filter((e) => !!e.deliveredAt).length;
  const cancelled = events.filter((e) => e.cancelled).length;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mb-1">
          Mi Calendario
        </h1>
        <p className="text-slate-500 text-sm">Sesiones programadas de tus cohortes</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Programadas", value: scheduled, color: "#60a5fa" },
          { label: "Impartidas", value: delivered, color: "#34d399" },
          { label: "Canceladas", value: cancelled, color: "#94a3b8" },
        ].map((s) => (
          <div key={s.label} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] sm:text-xs text-slate-500 truncate">{s.label}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{s.value}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Calendar */}
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
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className={cn("w-1.5 h-1.5 rounded-full", COLOR_DOT[getEventColor(e, releasedByCohort)])}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] text-slate-400 leading-none">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day detail (below calendar on click) */}
          {selected && (
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">
                {selected.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-slate-500">Sin sesiones este día.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => {
                    const color = getEventColor(ev, releasedByCohort);
                    return (
                      <div
                        key={ev.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border",
                          COLOR_BADGE[color]
                        )}
                      >
                        <span className="mt-0.5 shrink-0">{COLOR_ICON[color]}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{ev.title}</p>
                          <p className="text-xs opacity-70 truncate">{ev.cohortName} · {ev.courseTitle}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs opacity-60">
                            {ev.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={10} /> {ev.startTime}
                              </span>
                            )}
                            {ev.lessonTitle && (
                              <span className="flex items-center gap-1">
                                <BookOpen size={10} /> {ev.lessonTitle}
                              </span>
                            )}
                          </div>
                          {color === "delivered" && (
                            <p className="text-[11px] mt-1 text-emerald-400/60">
                              Clase impartida el {new Date(ev.deliveredAt!).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                            </p>
                          )}
                          {color === "released" && (
                            <p className="text-[11px] mt-1 text-orange-400/60">
                              Material disponible
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming */}
          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display mb-4">Próximas sesiones</h3>
            {(() => {
              const upcoming = events
                .filter((e) => !e.cancelled && e.scheduledAt && new Date(e.scheduledAt) >= today)
                .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
                .slice(0, 5);
              return upcoming.length === 0 ? (
                <p className="text-sm text-slate-500">No hay sesiones próximas.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((ev) => {
                    const color = getEventColor(ev, releasedByCohort);
                    return (
                      <div key={ev.id} className="flex flex-col gap-1 p-3 rounded-xl border border-white/[0.06]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white truncate">{ev.title}</p>
                          <span className={cn("w-2 h-2 rounded-full shrink-0", COLOR_DOT[color])} />
                        </div>
                        <p className="text-xs text-slate-400 truncate">{ev.cohortName}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(ev.scheduledAt!).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}
                          {ev.startTime ? ` · ${ev.startTime}` : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>

          {/* Legend */}
          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Leyenda</p>
            <div className="space-y-2">
              {(Object.entries(COLOR_LABEL) as [EventColor, string][]).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", COLOR_DOT[key])} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
