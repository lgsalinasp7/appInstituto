"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  isActive: boolean;
}

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/courses")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCourses(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Cursos</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista de cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {c.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.category} • {c.level}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            ))}
          </div>
          {courses.length === 0 && (
            <p className="text-muted-foreground">No hay cursos creados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
