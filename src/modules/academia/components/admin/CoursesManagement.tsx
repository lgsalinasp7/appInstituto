"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Clock3 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  isActive?: boolean;
}

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/courses")
      .then((r) => r.json())
      .then((res) => {
        const data = res?.data ?? res;
        const list = Array.isArray(data) ? data : (data?.id ? [data] : []);
        setCourses(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="academy-card-dark p-6 md:p-8">
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Cursos</h1>
        <p className="text-slate-400 mt-2">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="academy-card-dark p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-display">Gestión de cursos</h1>
        <p className="text-slate-400 mt-2">Vista académica unificada para docentes y administración.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <Link key={c.id} href={`/academia/admin/courses/${c.id}`}>
          <article className="group academy-card-dark overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg cursor-pointer">
            <div className="h-36 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 relative">
              <div className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider academy-pill-dark">
                {c.category}
              </div>
              <div className="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider academy-pill-dark">
                {c.isActive !== false ? "Activo" : "Inactivo"}
              </div>
              <div className="absolute left-4 bottom-4 w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">{c.title}</h3>
                <p className="text-sm text-slate-300 line-clamp-2 mt-1">{c.description ?? ""}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5" />
                  {c.level ? `Nivel ${c.level}` : "Bootcamp"}
                </span>
                <span className="font-semibold text-cyan-400 group-hover:text-cyan-300 inline-flex items-center gap-1 transition-colors">
                  Gestionar
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </article>
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="academy-card-dark p-8 text-center">
          <p className="text-slate-400">No hay cursos creados.</p>
        </div>
      )}
    </div>
  );
}
