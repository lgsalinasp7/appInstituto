"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  name: string;
  courseId: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  status: string;
  schedule: unknown;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  ACTIVE: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const DOT_COLOR: Record<string, string> = {
  DRAFT: "bg-slate-400",
  ACTIVE: "bg-cyan-400",
  COMPLETED: "bg-emerald-400",
  CANCELLED: "bg-red-400",
};

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

function dateIsInRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime() &&
    d <= new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Date | null>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    fetch("/api/academy/student/calendar")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  function getEventsForDay(day: number): CalendarEvent[] {
    const date = new Date(viewYear, viewMonth, day);
    return events.filter((e) =>
      dateIsInRange(date, new Date(e.startDate), new Date(e.endDate))
    );
  }

  const selectedDayEvents = selected
    ? events.filter((e) =>
        dateIsInRange(selected, new Date(e.startDate), new Date(e.endDate))
      )
    : [];

  const upcomingEvents = [...events]
    .filter((e) => new Date(e.endDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <h1 className="text-2xl font-bold text-white mb-4 font-display tracking-tight">Calendario</h1>
        <p className="text-slate-400">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Calendario</h1>
        <p className="text-slate-400 mt-1 text-base">Fechas de inicio y fin de tus cohortes.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Calendario mensual */}
        <div className="academy-card-dark p-5">
          {/* Header del mes */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-white font-display">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Celdas del calendario */}
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
                            className={cn("w-1.5 h-1.5 rounded-full", DOT_COLOR[e.status] ?? "bg-slate-400")}
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

          {/* Detalle del día seleccionado */}
          {selected && (
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">
                {selected.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-slate-500">Sin eventos este día.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((e) => (
                    <Link
                      key={e.id}
                      href={`/academia/student/cohort/${e.id}`}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border hover:border-cyan-500/30 transition-colors block",
                        STATUS_COLOR[e.status] ?? "bg-slate-700/30 border-slate-600 text-slate-300"
                      )}
                    >
                      <Circle className="w-2 h-2 mt-1.5 shrink-0 fill-current" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{e.name}</p>
                        <p className="text-xs opacity-70 truncate">{e.courseTitle}</p>
                        <p className="text-xs opacity-60 mt-0.5">
                          {new Date(e.startDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                          {" — "}
                          {new Date(e.endDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel lateral: próximos eventos */}
        <div className="space-y-4">
          <div className="academy-card-dark p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-display">Próximas Cohortes</h3>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No hay cohortes próximas.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/academia/student/cohort/${e.id}`}
                    className="flex flex-col gap-1 p-3 rounded-xl border border-white/[0.06] hover:border-cyan-500/20 transition-colors block"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{e.name}</p>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                        STATUS_COLOR[e.status] ?? "bg-slate-700 border-slate-600 text-slate-300"
                      )}>
                        {STATUS_LABEL[e.status] ?? e.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{e.courseTitle}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(e.startDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      {" — "}
                      {new Date(e.endDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="academy-card-dark p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Leyenda</p>
            <div className="space-y-2">
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", DOT_COLOR[key] ?? "bg-slate-400")} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
