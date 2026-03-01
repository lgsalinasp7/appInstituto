"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, BarChart3 } from "lucide-react";

export function AdminAcademyDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Administración de Academia</h1>
      <p className="text-muted-foreground">Gestiona cursos, cohortes y usuarios.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="/academia/admin/courses"
              className="text-sm text-primary hover:underline"
            >
              Gestionar cursos
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Cohortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="/academia/admin/cohorts"
              className="text-sm text-primary hover:underline"
            >
              Gestionar cohortes
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="/academia/admin/analytics"
              className="text-sm text-primary hover:underline"
            >
              Ver analytics
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
