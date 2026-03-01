"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: string;
  name: string | null;
  email: string;
  platformRole: string | null;
}

export function StudentsManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/students")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setUsers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Estudiantes</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Estudiantes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista de estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{u.name || u.email}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <span className="text-xs">{u.platformRole || "—"}</span>
              </div>
            ))}
          </div>
          {users.length === 0 && (
            <p className="text-muted-foreground">No hay estudiantes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
