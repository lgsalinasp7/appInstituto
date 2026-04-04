import Link from "next/link";
import { ArrowLeft, ExternalLink, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CohortStudentDeliverableRow {
  id: string;
  deliverableTitle: string;
  lessonTitle: string | null;
  weekNumber: number;
  status: string;
  githubUrl: string | null;
  deployUrl: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  feedback: string | null;
  score: string | null;
}

interface CohortStudentAdminDetailViewProps {
  cohortId: string;
  cohortName: string;
  courseTitle: string;
  studentName: string | null;
  studentEmail: string;
  enrollmentStatus: string;
  isTrial: boolean;
  trialExpiresAt: string | null;
  overallProgress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  deliverables: CohortStudentDeliverableRow[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ENTREGADO: "Entregado",
  EN_REVISION: "En revisión",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

export function CohortStudentAdminDetailView({
  cohortId,
  cohortName,
  courseTitle,
  studentName,
  studentEmail,
  enrollmentStatus,
  isTrial,
  trialExpiresAt,
  overallProgress,
  lessonsCompleted,
  lessonsTotal,
  deliverables,
}: CohortStudentAdminDetailViewProps) {
  const displayName = studentName || studentEmail;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/academia/admin/cohorts/${cohortId}/students`}
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a estudiantes
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">{displayName}</h1>
        <p className="text-slate-400 mt-1">
          <span className="text-white font-semibold">{cohortName}</span>
          <span className="mx-2 text-slate-600">·</span>
          {courseTitle}
        </p>
        <p className="text-sm text-slate-500 mt-1">{studentEmail}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="academy-card-dark p-5 rounded-xl border border-white/[0.08]">
          <p className="text-sm text-slate-400">Progreso general</p>
          <p className="text-2xl font-bold text-white mt-1">{overallProgress.toFixed(1)}%</p>
        </div>
        <div className="academy-card-dark p-5 rounded-xl border border-white/[0.08]">
          <p className="text-sm text-slate-400">Lecciones</p>
          <p className="text-2xl font-bold text-white mt-1">
            {lessonsCompleted} / {lessonsTotal}
          </p>
        </div>
        <div className="academy-card-dark p-5 rounded-xl border border-white/[0.08] flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-lg border",
              enrollmentStatus === "ACTIVE"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            )}
          >
            {enrollmentStatus}
          </span>
          {isTrial ? (
            <Badge
              variant="secondary"
              className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"
            >
              Prueba
              {trialExpiresAt ? ` · ${new Date(trialExpiresAt).toLocaleDateString()}` : ""}
            </Badge>
          ) : null}
        </div>
        <div className="academy-card-dark p-5 rounded-xl border border-white/[0.08] flex flex-col justify-center">
          <Link
            href="/academia/admin/deliverables"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <FileCheck className="w-4 h-4" />
            Revisar entregables del cohorte
          </Link>
        </div>
      </div>

      <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white font-display">Entregables del curso</h2>
          <span className="text-sm text-slate-500">{deliverables.length} registro{deliverables.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-3">
          {deliverables.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{d.deliverableTitle}</p>
                  <p className="text-xs text-slate-500">
                    Semana {d.weekNumber}
                    {d.lessonTitle ? ` · ${d.lessonTitle}` : ""}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 shrink-0">
                  {STATUS_LABEL[d.status] ?? d.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {d.githubUrl ? (
                  <a
                    href={d.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
                {d.deployUrl ? (
                  <a
                    href={d.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    Deploy <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                {d.submittedAt ? <span>Enviado: {new Date(d.submittedAt).toLocaleString()}</span> : null}
                {d.reviewedAt ? <span>Revisado: {new Date(d.reviewedAt).toLocaleString()}</span> : null}
                {d.score != null ? <span>Nota: {d.score}</span> : null}
              </div>
              {d.feedback ? (
                <p className="text-sm text-slate-400 border-t border-white/[0.06] pt-2 mt-2">
                  <span className="text-slate-500">Feedback: </span>
                  {d.feedback}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {deliverables.length === 0 && (
          <p className="text-slate-500 text-center py-8">No hay envíos de entregables para este curso.</p>
        )}
      </div>
    </div>
  );
}
