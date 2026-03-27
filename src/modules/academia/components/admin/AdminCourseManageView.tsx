"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  CalendarDays,
  Clock3,
  ArrowRightLeft,
  GitMerge,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  content?: string;
  duration: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  maxStudents?: number;
  kind?: string;
  promoPreset?: string | null;
  campaignLabel?: string | null;
  _count?: { enrollments: number };
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  cohorts: Cohort[];
}

export function AdminCourseManageView({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [tab, setTab] = useState<"contenido" | "cohortes">("contenido");

  const [moduleModal, setModuleModal] = useState<{ open: boolean; editing?: Module }>({ open: false });
  const [lessonModal, setLessonModal] = useState<{ open: boolean; moduleId: string; editing?: Lesson }>({
    open: false,
    moduleId: "",
  });
  const [cohortModal, setCohortModal] = useState<{ open: boolean; editing?: Cohort }>({ open: false });
  const [moveModal, setMoveModal] = useState<{ open: boolean; source: Cohort | null }>({
    open: false,
    source: null,
  });
  const [mergeModal, setMergeModal] = useState<{ open: boolean; source: Cohort | null }>({
    open: false,
    source: null,
  });
  const [teachersModal, setTeachersModal] = useState<{ open: boolean; cohort: Cohort | null }>({
    open: false,
    cohort: null,
  });
  const [teacherList, setTeacherList] = useState<{ id: string; name: string | null; email: string }[]>(
    []
  );
  const [teacherEmailInput, setTeacherEmailInput] = useState("");

  const loadTeachersForCohort = useCallback(async (cohortId: string) => {
    const res = await fetch(`/api/academy/cohorts/${cohortId}/teachers`);
    const json = await res.json();
    if (json.success) setTeacherList(json.data);
  }, []);

  const loadCourse = async () => {
    try {
      const res = await fetch(`/api/academy/courses/${courseId}`);
      const json = await res.json();
      if (json.success) setCourse(json.data);
    } catch {
      toast.error("Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (teachersModal.open && teachersModal.cohort) {
      void loadTeachersForCohort(teachersModal.cohort.id);
    }
  }, [teachersModal.open, teachersModal.cohort?.id, loadTeachersForCohort]);

  const handleCreateModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const order = course?.modules.length ?? 0;
    try {
      const res = await fetch("/api/academy/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, title, description, order }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Módulo creado");
        setModuleModal({ open: false });
        loadCourse();
      } else {
        toast.error(json.error || "Error al crear módulo");
      }
    } catch {
      toast.error("Error al crear módulo");
    }
  };

  const handleUpdateModule = async (e: React.FormEvent<HTMLFormElement>, moduleId: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    try {
      const res = await fetch(`/api/academy/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Módulo actualizado");
        setModuleModal({ open: false });
        loadCourse();
      } else {
        toast.error(json.error || "Error al actualizar");
      }
    } catch {
      toast.error("Error al actualizar módulo");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("¿Eliminar este módulo y todas sus lecciones?")) return;
    try {
      const res = await fetch(`/api/academy/modules/${moduleId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Módulo eliminado");
        loadCourse();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar módulo");
    }
  };

  const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const module = course?.modules.find((m) => m.id === lessonModal.moduleId);
    const order = module?.lessons.length ?? 0;
    try {
      const res = await fetch("/api/academy/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: lessonModal.moduleId,
          title: (form.elements.namedItem("title") as HTMLInputElement).value,
          description: "",
          content: (form.elements.namedItem("content") as HTMLTextAreaElement).value || "<p></p>",
          duration: parseInt((form.elements.namedItem("duration") as HTMLInputElement).value || "0", 10),
          order,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Lección creada");
        setLessonModal({ open: false, moduleId: "" });
        loadCourse();
      } else {
        toast.error(json.error || "Error al crear lección");
      }
    } catch {
      toast.error("Error al crear lección");
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent<HTMLFormElement>, lessonId: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const res = await fetch(`/api/academy/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: (form.elements.namedItem("title") as HTMLInputElement).value,
          content: (form.elements.namedItem("content") as HTMLTextAreaElement).value || "<p></p>",
          duration: parseInt((form.elements.namedItem("duration") as HTMLInputElement).value || "0", 10),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Lección actualizada");
        setLessonModal({ open: false, moduleId: "" });
        loadCourse();
      } else {
        toast.error(json.error || "Error al actualizar");
      }
    } catch {
      toast.error("Error al actualizar lección");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("¿Eliminar esta lección?")) return;
    try {
      const res = await fetch(`/api/academy/lessons/${lessonId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Lección eliminada");
        loadCourse();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar lección");
    }
  };

  const handleSaveCohort = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const kind = (form.elements.namedItem("kind") as HTMLSelectElement)?.value || "ACADEMIC";
    const promoPreset =
      (form.elements.namedItem("promoPreset") as HTMLSelectElement)?.value || undefined;
    const campaignLabel =
      (form.elements.namedItem("campaignLabel") as HTMLInputElement)?.value || undefined;
    let startDate = (form.elements.namedItem("startDate") as HTMLInputElement).value;
    let endDate = (form.elements.namedItem("endDate") as HTMLInputElement).value;
    if (kind === "PROMOTIONAL" && promoPreset && promoPreset !== "CUSTOM" && startDate) {
      const start = new Date(startDate + "T12:00:00");
      const end = new Date(start);
      if (promoPreset === "DAYS_3") end.setDate(end.getDate() + 3);
      if (promoPreset === "DAYS_7") end.setDate(end.getDate() + 7);
      endDate = end.toISOString().slice(0, 10);
    }
    const payload: Record<string, unknown> = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      startDate,
      endDate,
      maxStudents: parseInt(
        (form.elements.namedItem("maxStudents") as HTMLInputElement).value || "9999",
        10
      ),
      status: (form.elements.namedItem("status") as HTMLSelectElement)?.value || "DRAFT",
      kind,
    };
    if (kind === "PROMOTIONAL") {
      payload.promoPreset = promoPreset === "CUSTOM" ? "CUSTOM" : promoPreset;
      if (campaignLabel) payload.campaignLabel = campaignLabel;
    } else {
      payload.promoPreset = null;
      payload.campaignLabel = null;
    }
    const isEdit = !!cohortModal.editing;
    try {
      const res = isEdit
        ? await fetch(`/api/academy/cohorts/${cohortModal.editing!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/academy/cohorts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              courseId,
              status: "DRAFT",
              schedule: {},
            }),
          });
      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Cohorte actualizado" : "Cohorte creado");
        setCohortModal({ open: false });
        loadCourse();
      } else {
        toast.error(json.error || (isEdit ? "Error al actualizar" : "Error al crear cohorte"));
      }
    } catch {
      toast.error(isEdit ? "Error al actualizar cohorte" : "Error al crear cohorte");
    }
  };

  const handleDeleteCohort = async (cohortId: string) => {
    if (!confirm("¿Eliminar este cohorte? Solo se puede si no tiene estudiantes.")) return;
    try {
      const res = await fetch(`/api/academy/cohorts/${cohortId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Cohorte eliminado");
        loadCourse();
      } else {
        toast.error(json.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar cohorte");
    }
  };

  const handleMoveSubmit = async (targetCohortId: string) => {
    const source = moveModal.source;
    if (!source) return;
    try {
      const res = await fetch(`/api/academy/cohorts/${source.id}/move-enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCohortId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Se movieron ${json.data?.moved ?? 0} matrícula(s)`);
        setMoveModal({ open: false, source: null });
        loadCourse();
      } else {
        toast.error(json.error || "Error al mover");
      }
    } catch {
      toast.error("Error al mover matrículas");
    }
  };

  const handleMergeSubmit = async (targetCohortId: string) => {
    const source = mergeModal.source;
    if (!source) return;
    if (!confirm(`¿Unir "${source.name}" en el cohorte destino? El origen quedará cancelado.`)) return;
    try {
      const res = await fetch("/api/academy/cohorts/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCohortId: source.id, targetCohortId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Cohortes unidos");
        setMergeModal({ open: false, source: null });
        loadCourse();
      } else {
        toast.error(json.error || "Error al unir");
      }
    } catch {
      toast.error("Error al unir cohortes");
    }
  };

  const handleAssignTeacher = async () => {
    const c = teachersModal.cohort;
    const raw = teacherEmailInput.trim();
    if (!c || !raw) return;
    const payload = raw.includes("@")
      ? { teacherEmail: raw }
      : { teacherUserId: raw };
    try {
      const res = await fetch(`/api/academy/cohorts/${c.id}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Profesor asignado");
        setTeacherEmailInput("");
        await loadTeachersForCohort(c.id);
      } else {
        toast.error(json.error || "Error");
      }
    } catch {
      toast.error("Error al asignar profesor");
    }
  };

  if (loading || !course) {
    return (
      <div className="academy-card-dark p-8">
        <p className="text-slate-400">Cargando curso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/academia/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cursos
        </Link>
      </div>

      <div className="academy-card-dark p-6">
        <h1 className="text-3xl font-black tracking-tight text-white font-display">{course.title}</h1>
        <p className="text-slate-400 mt-1 line-clamp-2">{course.description}</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setTab("contenido")}
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors",
            tab === "contenido" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          Contenido
        </button>
        <button
          type="button"
          onClick={() => setTab("cohortes")}
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors",
            tab === "cohortes" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          Cohortes
        </button>
      </div>

      {tab === "contenido" && (
        <div className="academy-card-dark p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-display">Módulos y lecciones</h2>
            <Button
              size="sm"
              onClick={() => setModuleModal({ open: true })}
              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuevo módulo
            </Button>
          </div>
          <div className="space-y-2">
            {course.modules.map((module) => (
              <div
                key={module.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <div className="flex items-stretch min-w-0">
                  <button
                    type="button"
                    onClick={() => setOpenModuleId((prev) => (prev === module.id ? null : module.id))}
                    className="min-w-0 flex-1 px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="w-5 h-5 text-white/60 shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{module.title}</h3>
                        <p className="text-xs text-slate-400">{module.lessons.length} lecciones</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-slate-400 shrink-0 transition-transform",
                        openModuleId === module.id && "rotate-180"
                      )}
                    />
                  </button>
                  <div className="flex items-center gap-1 pr-3 shrink-0 border-l border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setModuleModal({ open: true, editing: module })}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                      title="Editar módulo"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      title="Eliminar módulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                  {openModuleId === module.id && (
                    <div className="px-5 pb-4 space-y-2 border-t border-white/[0.06] pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500">Lecciones</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setLessonModal({ open: true, moduleId: module.id })}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Nueva lección
                        </Button>
                      </div>
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                        >
                          <div className="flex items-center gap-3">
                            <Clock3 className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-200">{lesson.title}</span>
                            <span className="text-xs text-slate-500">{lesson.duration} min</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setLessonModal({ open: true, moduleId: module.id, editing: lesson })}
                              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {module.lessons.length === 0 && (
                        <p className="text-sm text-slate-500 py-2">Sin lecciones. Añade la primera.</p>
                      )}
                    </div>
                  )}
              </div>
            ))}
            {course.modules.length === 0 && (
              <p className="text-slate-500 py-6 text-center">No hay módulos. Crea el primero.</p>
            )}
          </div>
        </div>
      )}

      {tab === "cohortes" && (
        <div className="academy-card-dark p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-display">Cohortes del curso</h2>
            <Button
              size="sm"
              onClick={() => setCohortModal({ open: true })}
              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuevo cohorte
            </Button>
          </div>
          <div className="space-y-2">
            {course.cohorts.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(c.startDate).toLocaleDateString("es-CO")} -{" "}
                      {new Date(c.endDate).toLocaleDateString("es-CO")}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {c._count?.enrollments ?? 0} estudiantes
                      {c.kind === "PROMOTIONAL" ? " · Promocional" : " · Académico"}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 shrink-0">
                    {c.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTeachersModal({ open: true, cohort: c })}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    title="Profesores asignados"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoveModal({ open: true, source: c })}
                    className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5"
                    title="Mover estudiantes a otro cohorte"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMergeModal({ open: true, source: c })}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5"
                    title="Unir con otro cohorte (archiva origen)"
                  >
                    <GitMerge className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCohortModal({
                        open: true,
                        editing: c,
                      })
                    }
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    title="Editar cohorte"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCohort(c.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {course.cohorts.length === 0 && (
              <p className="text-slate-500 py-6 text-center">No hay cohortes. Crea el primero.</p>
            )}
          </div>
        </div>
      )}

      {/* Módulo modal */}
      <Dialog open={moduleModal.open} onOpenChange={(open) => setModuleModal({ open })}>
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              {moduleModal.editing ? "Editar módulo" : "Nuevo módulo"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) =>
              moduleModal.editing ? handleUpdateModule(e, moduleModal.editing.id) : handleCreateModule(e)
            }
            className="space-y-4"
          >
            <div>
              <Label className="text-slate-300">Título</Label>
              <Input
                name="title"
                defaultValue={moduleModal.editing?.title}
                className="mt-1 bg-slate-800 border-white/10 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Descripción</Label>
              <Textarea
                name="description"
                defaultValue={moduleModal.editing?.description}
                className="mt-1 bg-slate-800 border-white/10 text-white"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setModuleModal({ open: false })}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500">
                {moduleModal.editing ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lección modal */}
      <Dialog open={lessonModal.open} onOpenChange={(open) => setLessonModal({ ...lessonModal, open })}>
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {lessonModal.editing ? "Editar lección" : "Nueva lección"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) =>
              lessonModal.editing ? handleUpdateLesson(e, lessonModal.editing.id) : handleCreateLesson(e)
            }
            className="space-y-4"
          >
            <div>
              <Label className="text-slate-300">Título</Label>
              <Input
                name="title"
                defaultValue={lessonModal.editing?.title}
                className="mt-1 bg-slate-800 border-white/10 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Duración (minutos)</Label>
              <Input
                name="duration"
                type="number"
                min={0}
                defaultValue={lessonModal.editing?.duration ?? 30}
                className="mt-1 bg-slate-800 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Contenido (HTML)</Label>
              <Textarea
                name="content"
                defaultValue={lessonModal.editing?.content ?? "<p></p>"}
                className="mt-1 bg-slate-800 border-white/10 text-white font-mono text-sm"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setLessonModal({ open: false, moduleId: "" })}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500">
                {lessonModal.editing ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cohorte modal */}
      <Dialog open={cohortModal.open} onOpenChange={(open) => setCohortModal({ open })}>
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">{cohortModal.editing ? "Editar cohorte" : "Nuevo cohorte"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCohort} className="space-y-4">
            <div>
              <Label className="text-slate-300">Nombre</Label>
              <Input
                name="name"
                defaultValue={cohortModal.editing?.name}
                className="mt-1 bg-slate-800 border-white/10 text-white"
                required
                placeholder="Ej: Cohorte Enero 2026"
              />
            </div>
            <div>
              <Label className="text-slate-300">Tipo</Label>
              <select
                name="kind"
                defaultValue={cohortModal.editing?.kind ?? "ACADEMIC"}
                className="mt-1 w-full rounded-lg bg-slate-800 border border-white/10 text-white px-3 py-2"
              >
                <option value="ACADEMIC">Académico (bootcamp / ciclo largo)</option>
                <option value="PROMOTIONAL">Promocional (Ads / masterclass corta)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Académico: orientación típica ~4 meses (fechas manuales). Promocional: mismo curso, acceso limitado en
                tiempo; respeta trialAllowedLessonId en la matrícula.
              </p>
            </div>
            <div>
              <Label className="text-slate-300">Plantilla promocional</Label>
              <select
                name="promoPreset"
                defaultValue={cohortModal.editing?.promoPreset ?? "CUSTOM"}
                className="mt-1 w-full rounded-lg bg-slate-800 border border-white/10 text-white px-3 py-2"
              >
                <option value="DAYS_3">3 días desde inicio</option>
                <option value="DAYS_7">7 días desde inicio</option>
                <option value="CUSTOM">Personalizado (usar fechas abajo)</option>
              </select>
            </div>
            <div>
              <Label className="text-slate-300">Etiqueta campaña (opcional)</Label>
              <Input
                name="campaignLabel"
                defaultValue={cohortModal.editing?.campaignLabel ?? ""}
                className="mt-1 bg-slate-800 border-white/10 text-white"
                placeholder="Ej: FB Ads marzo 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Fecha inicio</Label>
                <Input
                  name="startDate"
                  type="date"
                  defaultValue={cohortModal.editing?.startDate?.slice(0, 10)}
                  className="mt-1 bg-slate-800 border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Fecha fin</Label>
                <Input
                  name="endDate"
                  type="date"
                  defaultValue={cohortModal.editing?.endDate?.slice(0, 10)}
                  className="mt-1 bg-slate-800 border-white/10 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Máx. estudiantes</Label>
              <Input
                name="maxStudents"
                type="number"
                min={1}
                defaultValue={cohortModal.editing?.maxStudents ?? 9999}
                className="mt-1 bg-slate-800 border-white/10 text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">Por defecto alto; cupos estrictos en una fase posterior.</p>
            </div>
            {cohortModal.editing && (
              <div>
                <Label className="text-slate-300">Estado</Label>
                <select
                  name="status"
                  defaultValue={cohortModal.editing.status}
                  className="mt-1 w-full rounded-lg bg-slate-800 border border-white/10 text-white px-3 py-2"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCohortModal({ open: false })}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500">
                {cohortModal.editing ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={moveModal.open} onOpenChange={(open) => setMoveModal({ open, source: open ? moveModal.source : null })}>
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">Mover matrículas</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Origen: <span className="text-white">{moveModal.source?.name}</span>. Selecciona cohorte destino (mismo curso).
          </p>
          <TargetCohortSelect
            cohorts={course.cohorts.filter((x) => x.id !== moveModal.source?.id)}
            onConfirm={(targetId) => void handleMoveSubmit(targetId)}
            onCancel={() => setMoveModal({ open: false, source: null })}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={mergeModal.open} onOpenChange={(open) => setMergeModal({ open, source: open ? mergeModal.source : null })}>
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">Unir cohortes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Origen: <span className="text-white">{mergeModal.source?.name}</span>. Todas las matrículas pasan al destino y
            el origen se marca cancelado.
          </p>
          <TargetCohortSelect
            cohorts={course.cohorts.filter((x) => x.id !== mergeModal.source?.id)}
            onConfirm={(targetId) => void handleMergeSubmit(targetId)}
            onCancel={() => setMergeModal({ open: false, source: null })}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={teachersModal.open}
        onOpenChange={(open) => {
          if (!open) setTeacherEmailInput("");
          setTeachersModal({ open, cohort: open ? teachersModal.cohort : null });
        }}
      >
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Profesores — {teachersModal.cohort?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {teacherList.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between text-sm text-slate-300 border border-white/10 rounded-lg px-3 py-2"
              >
                <span>
                  <span className="text-slate-200">{t.name || t.email}</span>
                  {t.name && t.email ? (
                    <span className="block text-[11px] text-slate-500">{t.email}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  className="text-red-400 text-xs"
                  onClick={() => {
                    const c = teachersModal.cohort;
                    if (!c) return;
                    void fetch(
                      `/api/academy/cohorts/${c.id}/teachers?teacherUserId=${encodeURIComponent(t.id)}`,
                      { method: "DELETE" }
                    ).then((r) => r.json()).then((j) => {
                      if (j.success) {
                        toast.success("Profesor desasignado");
                        void loadTeachersForCohort(c.id);
                      } else toast.error(j.error || "Error");
                    });
                  }}
                >
                  Quitar
                </button>
              </div>
            ))}
            {teacherList.length === 0 && (
              <p className="text-slate-500 text-sm">Ningún profesor asignado.</p>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Escribe el correo del usuario con rol profesor en Kaled Academy. Si no lleva @, se interpreta como ID interno
            (cuid).
          </p>
          <div className="flex gap-2 mt-1">
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={teacherEmailInput}
              onChange={(e) => setTeacherEmailInput(e.target.value)}
              placeholder="profesor@ejemplo.com"
              className="bg-slate-800 border-white/10 text-white"
            />
            <Button type="button" className="bg-cyan-600 shrink-0" onClick={() => void handleAssignTeacher()}>
              Asignar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TargetCohortSelect({
  cohorts,
  onConfirm,
  onCancel,
}: {
  cohorts: Cohort[];
  onConfirm: (id: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="space-y-4">
      <select
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full rounded-lg bg-slate-800 border border-white/10 text-white px-3 py-2"
      >
        <option value="">— Cohort destino —</option>
        {cohorts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          className="bg-cyan-600"
          disabled={!val}
          onClick={() => onConfirm(val)}
        >
          Confirmar
        </Button>
      </DialogFooter>
    </div>
  );
}
