"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";

export function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel del Profesor</h1>
      <p className="text-muted-foreground">Gestiona tus estudiantes y cursos.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ver y gestionar estudiantes inscritos.
            </p>
            <a
              href="/academia/teacher/students"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Ir a Estudiantes →
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ver cursos disponibles.
            </p>
            <a
              href="/academia/teacher/courses"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Ir a Cursos →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
