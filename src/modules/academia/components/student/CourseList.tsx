"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface Enrollment {
  id: string;
  courseId: string;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
  };
}

export function CourseList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/enrollments")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEnrollments(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Mis Cursos</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mis Cursos</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((e) => (
          <Link key={e.id} href={`/academia/student/courses/${e.courseId}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{e.course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {e.course.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Progreso: {Number(e.progress).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {enrollments.length === 0 && (
        <p className="text-muted-foreground">No tienes cursos inscritos.</p>
      )}
    </div>
  );
}
