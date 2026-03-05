"use client";

import { useEffect, useState } from "react";

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
      <div className="academy-card-dark p-8">
        <h1 className="text-2xl font-bold text-white mb-6 font-display tracking-tight">Estudiantes</h1>
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-white font-display">Estudiantes</h1>
      <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08] shadow-none">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Lista de estudiantes</h2>
        </div>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div>
                <p className="font-semibold text-white">{u.name || u.email}</p>
                <p className="text-sm text-slate-400">{u.email}</p>
              </div>
              <span className="text-xs font-medium text-slate-400 px-2 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04]">
                {u.platformRole || "—"}
              </span>
            </div>
          ))}
        </div>
        {users.length === 0 && (
          <p className="text-slate-500">No hay estudiantes.</p>
        )}
      </div>
    </div>
  );
}
