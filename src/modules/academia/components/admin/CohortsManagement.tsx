"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminCourseCohortsOperations } from "@/modules/academia/components/admin/AdminCourseCohortsOperations";

interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  kind?: string;
  maxStudents?: number;
  currentStudents?: number;
  _count?: { enrollments: number };
  course: { id: string; title: string };
}

interface CourseOption {
  id: string;
  title: string;
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  ACTIVE: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

function CourseCohortsWithParams({ courseId }: { courseId: string }) {
  return (
    <Suspense
      fallback={
        <div className="academy-card-dark p-8">
          <p className="text-slate-400">Cargando operaciones del curso…</p>
        </div>
      }
    >
      <AdminCourseCohortsOperations courseId={courseId} />
    </Suspense>
  );
}

function CohortsManagementInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(!courseId);
  const [pickCourseOpen, setPickCourseOpen] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (courseId) return;
    fetch("/api/academy/cohorts")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCohorts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (!pickCourseOpen) return;
    setCoursesLoading(true);
    fetch("/api/academy/courses")
      .then((r) => r.json())
      .then((res) => {
        const data = res?.data ?? res;
        const list = Array.isArray(data) ? data : data?.id ? [data] : [];
        setCourses(list.map((c: { id: string; title: string }) => ({ id: c.id, title: c.title })));
        if (list.length === 1) setSelectedCourseId(list[0].id);
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [pickCourseOpen]);

  if (courseId) {
    return <CourseCohortsWithParams courseId={courseId} />;
  }

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <h1 className="text-2xl font-bold text-white mb-6 font-display tracking-tight">Cohortes</h1>
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  const openNewCohortFlow = () => {
    setSelectedCourseId("");
    setPickCourseOpen(true);
  };

  const confirmCourseAndCreate = () => {
    if (!selectedCourseId) return;
    setPickCourseOpen(false);
    router.push(
      `/academia/admin/cohorts?courseId=${encodeURIComponent(selectedCourseId)}&new=1`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-display">Cohortes</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Listado de todas las ediciones. Usa <strong className="text-slate-300">Nuevo cohorte</strong> para alta
            guiada (elige curso y completa el formulario). El nombre del curso enlaza a la misma gestión por programa.
          </p>
        </div>
        <Button
          type="button"
          onClick={openNewCohortFlow}
          className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo cohorte
        </Button>
      </div>

      <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08] shadow-none">
        <h2 className="text-lg font-bold text-white font-display">Lista de cohortes</h2>
        <div className="space-y-2">
          {cohorts.map((c) => (
            <div
              key={c.id}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white">{c.name}</p>
                <p className="text-sm mt-0.5">
                  <Link
                    href={`/academia/admin/cohorts?courseId=${encodeURIComponent(c.course.id)}`}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {c.course.title}
                  </Link>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                  {" • "}
                  {c._count?.enrollments ?? c.currentStudents ?? 0}
                  {c.maxStudents != null ? `/${c.maxStudents}` : ""} estudiantes
                  {c.kind === "PROMOTIONAL" ? " · Promocional" : ""}
                </p>
              </div>
              <div className="flex flex-col items-stretch lg:items-end gap-2 shrink-0">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-lg border w-fit",
                    STATUS_STYLE[c.status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"
                  )}
                >
                  {c.status}
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-semibold">
                  <Link href={`/academia/admin/cohorts/${c.id}/students`} className="text-cyan-400 hover:text-cyan-300">
                    Estudiantes
                  </Link>
                  <Link href={`/academia/admin/cohorts/${c.id}/access`} className="text-cyan-400 hover:text-cyan-300">
                    Lecciones y calendario
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cohorts.length === 0 && <p className="text-slate-500">No hay cohortes.</p>}
      </div>

      <Dialog open={pickCourseOpen} onOpenChange={setPickCourseOpen}>
        <DialogContent className="academy-card-dark border-white/10 bg-slate-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo cohorte</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Cada cohorte pertenece a un curso. Elige el programa para abrir el formulario de alta.
          </p>
          {coursesLoading ? (
            <p className="text-sm text-slate-500 py-4">Cargando cursos…</p>
          ) : (
            <div className="space-y-2">
              <Label className="text-slate-300">Curso</Label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-white/10 text-white px-3 py-2.5 text-sm"
              >
                <option value="">— Selecciona —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setPickCourseOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-cyan-600 hover:bg-cyan-500"
              disabled={!selectedCourseId || coursesLoading}
              onClick={confirmCourseAndCreate}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CohortsManagement() {
  return (
    <Suspense
      fallback={
        <div className="academy-card-dark p-8">
          <p className="text-slate-400">Cargando cohortes…</p>
        </div>
      }
    >
      <CohortsManagementInner />
    </Suspense>
  );
}
