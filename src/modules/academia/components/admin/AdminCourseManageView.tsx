"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, Plus, Pencil, Trash2, BookOpen, Clock3, School } from "lucide-react";
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
import { AdminLessonEditorDialog } from "./AdminLessonEditorDialog";

interface Lesson {
  id: string;
  title: string;
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

interface CourseCohortSummary {
  id: string;
  name: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  cohorts: CourseCohortSummary[];
}

export function AdminCourseManageView({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  const [moduleModal, setModuleModal] = useState<{ open: boolean; editing?: Module }>({ open: false });
  const [lessonCreateModal, setLessonCreateModal] = useState<{ open: boolean; moduleId: string }>({
    open: false,
    moduleId: "",
  });
  const [lessonEditor, setLessonEditor] = useState<{ open: boolean; lessonId: string }>({
    open: false,
    lessonId: "",
  });
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
    const module = course?.modules.find((m) => m.id === lessonCreateModal.moduleId);
    const order = module?.lessons.length ?? 0;
    try {
      const res = await fetch("/api/academy/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: lessonCreateModal.moduleId,
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
        setLessonCreateModal({ open: false, moduleId: "" });
        loadCourse();
      } else {
        toast.error(json.error || "Error al crear lección");
      }
    } catch {
      toast.error("Error al crear lección");
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
                          onClick={() => setLessonCreateModal({ open: true, moduleId: module.id })}
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
                              onClick={() => setLessonEditor({ open: true, lessonId: lesson.id })}
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

      <div className="academy-card-dark p-6 space-y-4 rounded-xl border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
              <School className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Cohortes de este curso</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Las ediciones, cupos, profesores y operaciones sobre cohortes viven en{" "}
                <strong className="text-slate-300">Menú → Cohortes</strong>, centrado en este curso cuando entras desde
                aquí.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shrink-0"
          >
            <Link href={`/academia/admin/cohorts?courseId=${course.id}`}>Gestionar cohortes</Link>
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          {course.cohorts.length === 0
            ? "Aún no hay cohortes para este curso."
            : `${course.cohorts.length} cohorte${course.cohorts.length === 1 ? "" : "s"}`}
        </p>
        {course.cohorts.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {course.cohorts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/academia/admin/cohorts/${c.id}/students`}
                  className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

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

      <AdminLessonEditorDialog
        open={lessonEditor.open}
        onOpenChange={(o) =>
          setLessonEditor((s) => ({ open: o, lessonId: o ? s.lessonId : "" }))
        }
        lessonId={lessonEditor.lessonId}
        onSaved={loadCourse}
      />

      {/* Nueva lección (tras crear, edición completa en el editor) */}
      <Dialog
        open={lessonCreateModal.open}
        onOpenChange={(open) => setLessonCreateModal((s) => ({ ...s, open }))}
      >
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Nueva lección</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <Label className="text-slate-300">Título</Label>
              <Input
                name="title"
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
                defaultValue={30}
                className="mt-1 bg-slate-800 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Contenido (HTML)</Label>
              <Textarea
                name="content"
                defaultValue="<p></p>"
                className="mt-1 bg-slate-800 border-white/10 text-white font-mono text-sm min-h-[200px]"
                rows={12}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLessonCreateModal({ open: false, moduleId: "" })}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500">
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
