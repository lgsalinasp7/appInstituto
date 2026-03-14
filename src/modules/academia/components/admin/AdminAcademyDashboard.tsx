"use client";

import Link from "next/link";
import { BarChart3, BookOpen, Users, Calendar, Trophy } from "lucide-react";

export function AdminAcademyDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Administración de Academia</h1>
        <p className="text-slate-400 mt-1">Usa el menú lateral para gestionar cursos, cohortes, usuarios y analytics.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/academia/admin/analytics"
          className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Dashboard</p>
            <p className="text-lg font-bold text-white">Analytics</p>
          </div>
        </Link>
        <Link
          href="/academia/admin/courses"
          className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Cursos</p>
            <p className="text-lg font-bold text-white">Gestión</p>
          </div>
        </Link>
        <Link
          href="/academia/admin/cohorts"
          className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Cohortes</p>
            <p className="text-lg font-bold text-white">Gestión</p>
          </div>
        </Link>
        <Link
          href="/academia/admin/users"
          className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Usuarios</p>
            <p className="text-lg font-bold text-white">Gestión</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
