"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Play, CalendarDays, Clock3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  duration: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order?: number;
  lessons: Lesson[];
}

interface CourseData {
  enrollment: {
    course: {
      id: string;
      title: string;
      description: string;
      description2?: string | null;
      duration: string;
      durationWeeks?: number | null;
      modules: Module[];
    };
  };
  completedLessonIds: string[];
}

interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  courseId: string;
}

interface LessonViewerProps {
  courseId: string;
}

type SectionId = "descripcion" | "contenido" | "cronograma" | "ingreso";

export function LessonViewer({ courseId }: LessonViewerProps) {
  const router = useRouter();
  const [data, setData] = useState<CourseData | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("descripcion");
  const [scheduleMode, setScheduleMode] = useState<"FULL_TIME" | "PART_TIME">("FULL_TIME");
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    descripcion: null,
    contenido: null,
    cronograma: null,
    ingreso: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [progressRes, cohortsRes] = await Promise.all([
          fetch(`/api/academy/progress/${courseId}`),
          fetch("/api/academy/cohorts"),
        ]);

        const progressJson = await progressRes.json();
        if (progressJson.success) {
          setData(progressJson.data);
          const firstModule = progressJson.data.enrollment.course.modules[0];
          if (firstModule?.id) {
            setOpenModuleId(firstModule.id);
          }
        }

        const cohortsJson = await cohortsRes.json();
        if (cohortsJson.success) {
          setCohorts(cohortsJson.data);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [courseId]);

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
        <p className="text-slate-400">Cargando curso...</p>
      </div>
    );
  }

  const { course } = data.enrollment;
  const completedSet = new Set(data.completedLessonIds);
  const courseCohorts = cohorts.filter((cohort) => cohort.courseId === course.id);
  const sortedCohorts = [...courseCohorts].sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  const fullTimeCohorts = sortedCohorts.filter((cohort) => cohort.name.toUpperCase().includes("FULL"));
  const partTimeCohorts = sortedCohorts.filter((cohort) => cohort.name.toUpperCase().includes("PART"));
  const activeCohortsBase = scheduleMode === "FULL_TIME" ? fullTimeCohorts : partTimeCohorts;
  const activeCohorts = activeCohortsBase.length > 0 ? activeCohortsBase : sortedCohorts;

  const handleSectionClick = (section: SectionId) => {
    setActiveSection(section);
    sectionRefs.current[section]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedSet.size / totalLessons) * 100) : 0;
  const sectionButtons: Array<{ id: SectionId; label: string }> = [
    { id: "descripcion", label: "Descripción" },
    { id: "contenido", label: "Contenido" },
    { id: "cronograma", label: "Cronograma" },
    { id: "ingreso", label: "Proceso de ingreso" },
  ];
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[280px,1fr]">
      <aside className="space-y-4 xl:sticky xl:top-24 h-fit">
        <div className="academy-card-dark p-4">
          <Link href="/academia/student/courses" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Volver
          </Link>
          <h1 className="text-3xl mt-2 font-black tracking-tight text-white font-display">{course.title}</h1>
        </div>
        <nav className="academy-card-dark p-2">
          {sectionButtons.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSectionClick(item.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-semibold flex items-center justify-between",
                activeSection === item.id ? "academy-menu-item-active-dark" : "academy-menu-item-inactive-dark hover:bg-white/[0.04]"
              )}
            >
                <span className={activeSection === item.id ? "text-white" : ""}>{item.label}</span>
              <ChevronRight className={cn("w-4 h-4", activeSection === item.id ? "text-white" : "text-slate-400")} />
            </button>
          ))}
        </nav>
      </aside>

      <div className="space-y-5">
        <section ref={(el) => { sectionRefs.current.descripcion = el; }} className="academy-card-dark p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white font-display">Conviértete en {course.title}</h2>
              <p className="text-slate-300 mt-2 max-w-3xl leading-relaxed">{course.description}</p>
              {course.description2 && <p className="text-slate-400 mt-3 text-sm">{course.description2}</p>}
            </div>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 rounded-xl font-bold shadow-lg shadow-cyan-900/20">
              Aplicar a la carrera
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" />
              {course.duration}
            </span>
            <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold">
              {course.durationWeeks ?? 24} semanas
            </span>
            <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold">
              Progreso {progressPercent}%
            </span>
          </div>
        </section>

        <section ref={(el) => { sectionRefs.current.contenido = el; }} className="academy-card-dark p-6 space-y-4">
          <div className="inline-flex items-center rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2 text-sm font-bold">Módulos</div>
          <div className="space-y-3">
            {course.modules.map((module) => {
              const isOpen = openModuleId === module.id;
              return (
                <div key={module.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenModuleId((prev) => (prev === module.id ? null : module.id))}
                    className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white font-display">
                        M{module.order || course.modules.indexOf(module) + 1}
                      </h3>
                      <p className="text-slate-200 font-semibold">{module.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{module.lessons.length} lecciones</p>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2">
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedSet.has(lesson.id);
                        const isSelected = selectedLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all border",
                              isSelected
                                ? "border-cyan-500/30 bg-cyan-500/10 text-white"
                                : "border-transparent hover:border-white/10 hover:bg-white/[0.03] text-slate-300"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                            ) : (
                              <Play className="w-4 h-4 shrink-0 text-slate-400" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                            <span className="text-xs text-slate-500 ml-auto">{lesson.duration}m</span>
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
            <Card className="border-white/[0.08] bg-white/[0.03] shadow-none rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-bold text-white">{selectedLesson.title}</h3>
                  <Button
                    size="sm"
                    onClick={() => handleComplete(selectedLesson.id)}
                    disabled={completedSet.has(selectedLesson.id)}
                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0"
                  >
                    {completedSet.has(selectedLesson.id) ? "Completada" : "Marcar como completada"}
                  </Button>
                </div>

                {selectedLesson.videoUrl && (
                  <div className="rounded-xl overflow-hidden bg-black">
                    <video
                      src={selectedLesson.videoUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                )}

                <div
                  className="prose prose-sm prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />
              </CardContent>
            </Card>
          )}
        </section>

        <section ref={(el) => { sectionRefs.current.cronograma = el; }} className="academy-card-dark p-6">
          <h2 className="text-2xl font-black tracking-tight text-white font-display">Próximas fechas</h2>
          <p className="text-slate-400 mt-1 text-sm">Todos los meses comienzan nuevos grupos de estudio para esta carrera.</p>
          <div className="mt-4 inline-flex rounded-xl border border-white/[0.08] p-1 bg-white/[0.03]">
            <button
              type="button"
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-colors", scheduleMode === "FULL_TIME" ? "academy-pill-active-dark" : "text-slate-400 hover:text-slate-300")}
              onClick={() => setScheduleMode("FULL_TIME")}
            >
              Full Time
            </button>
            <button
              type="button"
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-colors", scheduleMode === "PART_TIME" ? "academy-pill-active-dark" : "text-slate-400 hover:text-slate-300")}
              onClick={() => setScheduleMode("PART_TIME")}
            >
              Part Time
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {activeCohorts.length > 0 ? activeCohorts.map((cohort) => (
              <div key={cohort.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{cohort.name}</p>
                  <p className="text-sm text-slate-400">{formatDateRange(cohort.startDate, cohort.endDate)}</p>
                </div>
                <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {cohort.status}
                </span>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-slate-400">
                No hay cohortes publicadas para esta modalidad.
              </div>
            )}
          </div>
        </section>

        <section ref={(el) => { sectionRefs.current.ingreso = el; }} className="academy-card-dark p-6">
          <h2 className="text-2xl font-black tracking-tight text-white font-display">Proceso de ingreso</h2>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            Te acompañamos desde la postulación hasta el inicio del programa. Si tienes dudas, nuestro equipo te orienta paso a paso.
          </p>
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">¿Dudas o consultas?</p>
              <p className="text-lg font-bold text-white">Envía un mail a admissions@kaledacademy.com</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-white/20 text-slate-200 hover:bg-white/5 hover:border-cyan-500/30 hover:text-white transition-colors"
              onClick={() => router.push("mailto:admissions@kaledacademy.com")}
            >
              Contactar
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
