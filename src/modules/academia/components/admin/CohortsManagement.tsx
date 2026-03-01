"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  maxStudents: number;
  currentStudents: number;
  course: { title: string };
}

export function CohortsManagement() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/cohorts")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCohorts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Cohortes</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Gestión de Cohortes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista de cohortes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cohorts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.course.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.startDate).toLocaleDateString()} -{" "}
                    {new Date(c.endDate).toLocaleDateString()} • {c.currentStudents}/
                    {c.maxStudents} estudiantes
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-muted">{c.status}</span>
              </div>
            ))}
          </div>
          {cohorts.length === 0 && (
            <p className="text-muted-foreground">No hay cohortes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
