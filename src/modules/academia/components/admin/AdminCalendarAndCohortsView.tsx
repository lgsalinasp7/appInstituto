"use client";

import { useState } from "react";
import { CalendarDays, Users } from "lucide-react";
import { CalendarView } from "@/modules/academia/components/student/CalendarView";
import { CohortsManagement } from "@/modules/academia/components/admin/CohortsManagement";
import { cn } from "@/lib/utils";

type TabId = "calendar" | "cohorts";

export function AdminCalendarAndCohortsView() {
  const [tab, setTab] = useState<TabId>("calendar");

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "calendar", label: "Calendario", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "cohorts", label: "Cohortes", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Calendario y cohortes</h1>
        <p className="text-slate-400 mt-1 text-base">
          Vista de fechas y gestión de cohortes en un solo lugar.
        </p>
      </header>

      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors",
              tab === t.id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "calendar" && <CalendarView />}
      {tab === "cohorts" && <CohortsManagement />}
    </div>
  );
}
