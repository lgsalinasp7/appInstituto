"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, User } from "lucide-react";

function getRoleLabel(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  if (user?.platformRole === "SUPER_ADMIN") return "Super Admin";
  if (user?.platformRole === "ASESOR_COMERCIAL") return "Asesor Comercial";
  if (user?.platformRole === "MARKETING") return "Marketing";
  return user?.role?.name || "Plataforma";
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-slate-400">No hay usuario autenticado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mi Perfil (Plataforma)</h1>
        <p className="text-slate-400 mt-1">
          Perfil de acceso al dashboard principal de KaledSoft.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Avatar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {getInitials(user.name)}
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-white">{user.name || "Usuario"}</p>
              <Badge variant="outline" className="mt-2 text-slate-200 border-slate-700">
                {getRoleLabel(user)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Información de Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-100">
            <div className="space-y-2">
              <Label htmlFor="admin-name" className="flex items-center gap-2 text-slate-200">
                <User size={16} />
                Nombre
              </Label>
              <Input
                id="admin-name"
                value={user.name || ""}
                disabled
                className="bg-slate-950/70 border-slate-700 text-slate-100 disabled:opacity-100 disabled:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email" className="flex items-center gap-2 text-slate-200">
                <Mail size={16} />
                Correo
              </Label>
              <Input
                id="admin-email"
                value={user.email || ""}
                disabled
                className="bg-slate-950/70 border-slate-700 text-slate-100 disabled:opacity-100 disabled:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-role" className="flex items-center gap-2 text-slate-200">
                <Shield size={16} />
                Rol de Plataforma
              </Label>
              <Input
                id="admin-role"
                value={getRoleLabel(user)}
                disabled
                className="bg-slate-950/70 border-slate-700 text-slate-100 disabled:opacity-100 disabled:text-slate-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
