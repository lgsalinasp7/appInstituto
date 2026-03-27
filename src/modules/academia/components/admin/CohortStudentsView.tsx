import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CohortStudentsRow {
  enrollmentId: string;
  userId: string;
  name: string | null;
  email: string;
  status: string;
  isTrial: boolean;
  enrolledAt: string;
  trialExpiresAt: string | null;
}

interface CohortStudentsViewProps {
  cohortId: string;
  cohortName: string;
  courseTitle: string;
  rows: CohortStudentsRow[];
}

export function CohortStudentsView({
  cohortId,
  cohortName,
  courseTitle,
  rows,
}: CohortStudentsViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/academia/admin/cohorts"
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a cohortes
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white font-display">
            Estudiantes del cohorte
          </h1>
          <p className="text-slate-400 mt-1">
            <span className="text-white font-semibold">{cohortName}</span>
            <span className="mx-2 text-slate-600">·</span>
            {courseTitle}
          </p>
        </div>
        <Link
          href={`/academia/admin/cohorts/${cohortId}/access`}
          className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 shrink-0"
        >
          Lecciones y calendario
        </Link>
      </div>

      <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08] shadow-none">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white font-display">Matriculados</h2>
          <span className="text-sm text-slate-500">{rows.length} estudiante{rows.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.enrollmentId}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{row.name || row.email}</p>
                <p className="text-sm text-slate-400 truncate">{row.email}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Alta: {new Date(row.enrolledAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {row.isTrial ? (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"
                  >
                    Prueba
                    {row.trialExpiresAt
                      ? ` · ${new Date(row.trialExpiresAt).toLocaleDateString()}`
                      : ""}
                  </Badge>
                ) : null}
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-lg border",
                    row.status === "ACTIVE"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                  )}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="text-slate-500 text-center py-8">No hay estudiantes matriculados en este cohorte.</p>
        )}
      </div>
    </div>
  );
}
