"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Play,
  BookOpen,
  Video,
  Users,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { VideoProgressTracker } from "./VideoProgressTracker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string | null;
  duration: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CohortData {
  cohort: { id: string; name: string; startDate: string; endDate: string; status: string };
  course: { id: string; title: string; modules: Module[] };
  events: Array<{ id: string; title: string; type: string; dayOfWeek?: number; startTime?: string; endTime?: string; scheduledAt?: string }>;
  assessments: Array<{ id: string; title: string; type: string; scheduledAt: string }>;
  members: Array<{ id: string; name: string | null; email: string; image: string | null }>;
  completedLessonIds: string[];
}

type SectionId = "contenido" | "video" | "miembros" | "datos";

export function CohortView({ cohortId }: { cohortId: string }) {
  const [data, setData] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("contenido");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetch(`/api/academy/student/cohort/${cohortId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
          const firstMod = res.data.course.modules[0];
          if (firstMod?.id) setOpenModuleId(firstMod.id);
        }
      })
      .finally(() => setLoading(false));
  }, [cohortId]);

  const handleComplete = async (lessonId: string) => {
    const res = await fetch("/api/academy/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    if (res.ok && data) {
      setData({
        ...data,
        completedLessonIds: [...data.completedLessonIds, lessonId],
      });
    }
  };

  if (loading || !data) {
    return (
      <div className="academy-card-dark p-8">
        <p className="text-slate-400">Cargando cohorte...</p>
      </div>
    );
  }

  const { cohort, course, events, assessments, members, completedLessonIds } = data;
  const completedSet = new Set(completedLessonIds);
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedSet.size / totalLessons) * 100) : 0;

  const navItems: Array<{ id: SectionId; label: string; icon: React.ReactNode }> = [
    { id: "contenido", label: "Contenido", icon: <BookOpen className="w-4 h-4" /> },
    { id: "video", label: "Video Feed", icon: <Video className="w-4 h-4" /> },
    { id: "miembros", label: "Miembros", icon: <Users className="w-4 h-4" /> },
    { id: "datos", label: "Datos Académicos", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[280px,1fr]">
      <aside className="space-y-4 xl:sticky xl:top-24 h-fit">
        <div className="academy-card-dark p-4">
          <Link
            href="/academia/student"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Volver a la home
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white font-display mt-2">Mi Cohorte</h1>
        </div>

        <div className="academy-card-dark p-4">
          <h3 className="text-sm font-bold text-white font-display">{cohort.name}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Inicio: {new Date(cohort.startDate).toLocaleDateString("es-CO")} - Fin:{" "}
            {new Date(cohort.endDate).toLocaleDateString("es-CO")}
          </p>
        </div>

        <nav className="academy-card-dark p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all font-semibold flex items-center justify-between",
                activeSection === item.id ? "academy-menu-item-active-dark" : "academy-menu-item-inactive-dark hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2">{item.icon}{item.label}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </nav>

        {events.length > 0 && (
          <div className="academy-card-dark p-4">
            <h3 className="text-sm font-bold text-white font-display mb-3">Próximos espacios</h3>
            <div className="space-y-2">
              {events.slice(0, 3).map((e) => (
                <div key={e.id} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs font-semibold text-white">{e.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {e.startTime && e.endTime ? `${e.startTime} -> ${e.endTime}` : e.scheduledAt ? new Date(e.scheduledAt).toLocaleString("es-CO") : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {assessments.length > 0 && (
          <div className="academy-card-dark p-4">
            <h3 className="text-sm font-bold text-white font-display mb-3">Evaluaciones</h3>
            <div className="space-y-2">
              {assessments.slice(0, 3).map((a) => (
                <div key={a.id} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs font-semibold text-white">{a.title}</p>
                  <p className="text-[10px] text-slate-500">{new Date(a.scheduledAt).toLocaleString("es-CO")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div className="space-y-6">
        {activeSection === "contenido" && (
          <>
            <div className="academy-card-dark p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progreso</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white">{progressPercent}%</span>
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="academy-card-dark p-6 space-y-4">
              <h2 className="text-lg font-bold text-white font-display">Módulos</h2>
              <div className="space-y-3">
                {course.modules.map((module) => {
                  const moduleLessons = module.lessons;
                  const completedInModule = moduleLessons.filter((l) => completedSet.has(l.id)).length;
                  const moduleProgress = moduleLessons.length > 0 ? Math.round((completedInModule / moduleLessons.length) * 100) : 0;
                  const isOpen = openModuleId === module.id;

                  return (
                    <div key={module.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenModuleId((prev) => (prev === module.id ? null : module.id))}
                        className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                      >
                        <div>
                          <h3 className="text-lg font-bold text-white">Módulo {module.order + 1}</h3>
                          <p className="text-slate-200 font-semibold">{module.title}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {moduleLessons.length} lecciones · {moduleLessons.reduce((a, l) => a + l.duration, 0)} min
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-cyan-500/80"
                                style={{ width: `${moduleProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500">{moduleProgress}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {completedInModule === moduleLessons.length && moduleLessons.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Completado</span>
                          )}
                          <ChevronDown className={cn("w-5 h-5 text-slate-400", isOpen && "rotate-180")} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 space-y-2 border-t border-white/[0.06] pt-4">
                          {moduleLessons.map((lesson) => {
                            const isCompleted = completedSet.has(lesson.id);
                            const isSelected = selectedLesson?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm transition-all border",
                                  isSelected ? "border-cyan-500/30 bg-cyan-500/10 text-white" : "border-transparent hover:border-white/10 hover:bg-white/[0.03] text-slate-300"
                                )}
                              >
                                {isCompleted ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Play className="w-4 h-4 text-slate-400 shrink-0" />}
                                <span className="truncate flex-1">{lesson.title}</span>
                                <span className="text-xs text-slate-500">{lesson.duration} min</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedLesson && (
                <div className="mt-6 p-5 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{selectedLesson.title}</h3>
                    <Button
                      size="sm"
                      onClick={() => handleComplete(selectedLesson.id)}
                      disabled={completedSet.has(selectedLesson.id)}
                      className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      {completedSet.has(selectedLesson.id) ? "Completada" : "Marcar como completada"}
                    </Button>
                  </div>
                  {selectedLesson.videoUrl && (
                    <VideoProgressTracker
                      lessonId={selectedLesson.id}
                      videoUrl={selectedLesson.videoUrl}
                      className="rounded-xl overflow-hidden bg-black mb-4"
                    />
                  )}
                  {selectedLesson.content && (
                    <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === "video" && (
          <div className="academy-card-dark p-6">
            <h2 className="text-lg font-bold text-white font-display mb-4">Video Feed</h2>
            <div className="space-y-3">
              {course.modules.flatMap((m) =>
                m.lessons.filter((l) => l.videoUrl).map((l) => (
                  <div key={l.id} className="flex items-center gap-4 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Play className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{l.title}</p>
                      <p className="text-xs text-slate-500">{l.duration} min</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedLesson(l);
                        setActiveSection("contenido");
                      }}
                      className="ml-auto rounded-xl bg-cyan-600 hover:bg-cyan-500"
                    >
                      Ver
                    </Button>
                  </div>
                ))
              )}
            </div>
            {course.modules.every((m) => m.lessons.every((l) => !l.videoUrl)) && (
              <p className="text-slate-500 py-8 text-center">No hay videos en las lecciones.</p>
            )}
          </div>
        )}

        {activeSection === "miembros" && (
          <div className="academy-card-dark p-6">
            <h2 className="text-lg font-bold text-white font-display mb-4">Miembros del cohorte</h2>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                    {m.name?.slice(0, 2).toUpperCase() ?? m.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{m.name ?? m.email}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
            {members.length === 0 && <p className="text-slate-500 py-8 text-center">Aún no hay miembros inscritos.</p>}
          </div>
        )}

        {activeSection === "datos" && (
          <div className="academy-card-dark p-6">
            <h2 className="text-lg font-bold text-white font-display mb-4">Datos Académicos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Progreso total</p>
                <p className="text-2xl font-black text-cyan-400">{progressPercent}%</p>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Lecciones completadas</p>
                <p className="text-2xl font-black text-white">{completedSet.size} / {totalLessons}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
