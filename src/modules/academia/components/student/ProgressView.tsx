"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight } from "lucide-react";

interface CourseProgressSummary {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export function ProgressView() {
  const [summaries, setSummaries] = useState<CourseProgressSummary[]>([]);
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
        <h1 className="text-2xl font-bold mb-6">Mi Progreso</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const totalCompleted = summaries.reduce((s, c) => s + c.completedLessons, 0);
  const totalLessons = summaries.reduce((s, c) => s + c.totalLessons, 0);
  const overallPercent = totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mi Progreso</h1>

      <Card>
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {totalCompleted} de {totalLessons} lecciones completadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          {summaries.length === 0 && (
            <p className="text-muted-foreground">No tienes cursos inscritos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
