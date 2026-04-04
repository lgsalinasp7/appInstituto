"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
import { InviteUserModal } from "@/modules/config/components/InviteUserModal";
import { InviteTrialModal } from "@/modules/academia/components/InviteTrialModal";
import { useAuthStore } from "@/lib/store/auth-store";
import { getAcademyRoleLabel } from "@/lib/academy-role-labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type EnrollmentRow =
  | { id: string }
  | {
      id: string;
      isTrial: boolean;
      cohortId: string | null;
      cohort: { name: string } | null;
      course: { title: string } | null;
    };

interface User {
  id: string;
  name: string | null;
  email: string;
  platformRole: string | null;
  academyEnrollments?: EnrollmentRow[];
}

function userHasTrialBadge(u: User): boolean {
  const en = u.academyEnrollments;
  if (!en?.length) return false;
  const first = en[0];
  if ("isTrial" in first) {
    return en.some((e) => "isTrial" in e && e.isTrial === true);
  }
  return true;
}

function cohortLabelsForUser(u: User): string[] {
  const en = u.academyEnrollments;
  if (!en?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of en) {
    if (!("cohortId" in e) || !e.cohortId || !e.cohort?.name) continue;
    if (seen.has(e.cohortId)) continue;
    seen.add(e.cohortId);
    const coursePart = e.course?.title ? ` · ${e.course.title}` : "";
    out.push(`${e.cohort.name}${coursePart}`);
  }
  return out;
}

export function StudentsManagement({ embedded = false }: { embedded?: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [cohortFilter, setCohortFilter] = useState<string>("ALL");
  const [teacherCohorts, setTeacherCohorts] = useState<{ id: string; name: string }[]>([]);
  const { user } = useAuthStore();
  const isTeacher = user?.platformRole === "ACADEMY_TEACHER";

  // Pueden invitar: Super Admin, Admin de Academia, o Administrador del tenant. Los profesores (ACADEMY_TEACHER) no pueden invitar.
  const tenantRole = user?.role?.name?.trim().toUpperCase() ?? "";
  const canInvite =
    tenantRole === "SUPERADMIN" ||
    tenantRole === "ADMINISTRADOR" ||
    user?.platformRole === "SUPER_ADMIN" ||
    user?.platformRole === "ACADEMY_ADMIN";

  useEffect(() => {
    if (!isTeacher) return;
    fetch("/api/academy/cohorts")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setTeacherCohorts(
            res.data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))
          );
        }
      })
      .catch(() => {});
  }, [isTeacher]);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    const url =
      isTeacher && cohortFilter !== "ALL"
        ? `/api/academy/students?cohortId=${encodeURIComponent(cohortFilter)}`
        : "/api/academy/students";
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setUsers(res.data);
        else if (res.error) toast.error(res.error);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isTeacher, cohortFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="academy-card-dark p-8">
          {!embedded && (
            <h1 className="text-2xl font-bold text-white mb-6 font-display tracking-tight">Estudiantes</h1>
          )}
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {(!embedded || canInvite) && (
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center gap-4",
            embedded && canInvite ? "sm:justify-end" : "sm:justify-between"
          )}
        >
          {!embedded && (
            <h1 className="text-3xl font-black tracking-tight text-white font-display">Estudiantes</h1>
          )}
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
      )}
      <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08] shadow-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Lista de estudiantes</h2>
          </div>
          {isTeacher && teacherCohorts.length > 0 ? (
            <label className="flex flex-col gap-1.5 text-xs text-slate-400 shrink-0">
              <span className="font-medium text-slate-300">Filtrar por cohorte</span>
              <select
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
                className="rounded-lg border border-white/[0.12] bg-white/[0.06] text-white text-sm px-3 py-2 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="ALL">Todos mis cohortes</option>
                {teacherCohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="space-y-2">
          {users.map((u) => {
            const cohortLabels = isTeacher ? cohortLabelsForUser(u) : [];
            return (
            <div
              key={u.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white">{u.name || u.email}</p>
                <p className="text-sm text-slate-400">{u.email}</p>
                {cohortLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cohortLabels.map((label, idx) => (
                      <span
                        key={`${u.id}-cohort-${idx}`}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md border border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {userHasTrialBadge(u) ? (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                    Prueba
                  </Badge>
                ) : null}
                <span className="text-xs font-medium text-slate-400 px-2 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04]">
                  {getAcademyRoleLabel(u.platformRole)}
                </span>
              </div>
            </div>
            );
          })}
        </div>
        {users.length === 0 && (
          <p className="text-slate-500">No hay estudiantes.</p>
        )}
      </div>

      {canInvite && (
        <InvitationsSection onInviteSuccess={fetchStudents} />
      )}

      <InviteUserModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onInviteSuccess={fetchStudents}
        defaultAcademyRole="ACADEMY_STUDENT"
      />
      <InviteTrialModal
        open={isTrialModalOpen}
        onOpenChange={setIsTrialModalOpen}
        onInviteSuccess={fetchStudents}
        useAdminApi={false}
      />
    </div>
  );
}

function InvitationsSection({ onInviteSuccess }: { onInviteSuccess: () => void }) {
  const [invitations, setInvitations] = useState<Array<{
    id: string;
    email: string;
    status: string;
    academyRole: string | null;
    createdAt: string;
    role: { name: string };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      if (data.success) setInvitations(data.data);
    } catch {
      toast.error("Error al cargar invitaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleDelete = async (invitationId: string) => {
    setDeletingId(invitationId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Invitación eliminada. Puedes enviar una nueva.");
        fetchInvitations();
        onInviteSuccess();
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar invitación");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08]">
      <div>
        <h2 className="text-lg font-bold text-white font-display">Invitaciones enviadas</h2>
        <p className="text-sm text-slate-400 mt-1">
          Elimina invitaciones pendientes para reenviar en caso de error.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        </div>
      ) : invitations.length === 0 ? (
        <p className="text-slate-500 text-sm">No hay invitaciones enviadas.</p>
      ) : (
      <div className="space-y-2">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div>
              <p className="font-medium text-white">{inv.email}</p>
              <p className="text-xs text-slate-500">
                {inv.academyRole ? getAcademyRoleLabel(inv.academyRole) : inv.role.name} •{" "}
                {new Date(inv.createdAt).toLocaleDateString("es-CO")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "text-[10px]",
                  inv.status === "PENDING"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : inv.status === "ACCEPTED"
                      ? "bg-green-500/15 text-green-400 border-green-500/30"
                      : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                )}
              >
                {inv.status === "PENDING" ? "Pendiente" : inv.status === "ACCEPTED" ? "Aceptada" : "Expirada"}
              </Badge>
              {inv.status === "PENDING" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDelete(inv.id)}
                  disabled={deletingId === inv.id}
                  title="Eliminar para reenviar"
                >
                  {deletingId === inv.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
