"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { InviteUserModal } from "@/modules/config/components/InviteUserModal";
import { useAuthStore } from "@/lib/store/auth-store";
import { getAcademyRoleLabel } from "@/lib/academy-role-labels";

interface User {
  id: string;
  name: string | null;
  email: string;
  platformRole: string | null;
}

export function StudentsManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { user } = useAuthStore();
  // Pueden invitar: Super Admin, Admin de Academia, o Administrador del tenant. Los profesores (ACADEMY_TEACHER) no pueden invitar.
  const canInvite =
    (user?.role?.name?.toUpperCase() === "SUPERADMIN") ||
    user?.platformRole === "SUPER_ADMIN" ||
    user?.platformRole === "ACADEMY_ADMIN" ||
    user?.role?.name === "ADMINISTRADOR";

  const fetchStudents = useCallback(() => {
    fetch("/api/academy/students")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setUsers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="academy-card-dark p-8">
          <h1 className="text-2xl font-bold text-white mb-6 font-display tracking-tight">Estudiantes</h1>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Estudiantes</h1>
        {canInvite && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Invitar estudiante
          </button>
        )}
      </div>
      <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08] shadow-none">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Lista de estudiantes</h2>
        </div>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div>
                <p className="font-semibold text-white">{u.name || u.email}</p>
                <p className="text-sm text-slate-400">{u.email}</p>
              </div>
              <span className="text-xs font-medium text-slate-400 px-2 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04]">
                {getAcademyRoleLabel(u.platformRole)}
              </span>
            </div>
          ))}
        </div>
        {users.length === 0 && (
          <p className="text-slate-500">No hay estudiantes.</p>
        )}
      </div>

      <InviteUserModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onInviteSuccess={fetchStudents}
        defaultAcademyRole="ACADEMY_STUDENT"
      />
    </div>
  );
}
