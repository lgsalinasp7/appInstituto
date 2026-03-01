"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight } from "lucide-react";

interface CourseSummary {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export function StudentDashboard() {
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/progress")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSummaries(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Mi Academia</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Bienvenido a Academia</h1>
      <p className="text-muted-foreground">
        Continúa tu aprendizaje y revisa tu progreso.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Mis Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          {summaries.length === 0 ? (
            <p className="text-muted-foreground">No tienes cursos inscritos.</p>
          ) : (
            <div className="space-y-4">
              {summaries.map((s) => (
                <Link
                  key={s.courseId}
                  href={`/academia/student/courses/${s.courseId}`}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{s.courseTitle}</p>
                    <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${s.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.completedLessons} / {s.totalLessons} lecciones
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
