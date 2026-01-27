"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No hay usuario autenticado</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Mi Perfil"
        subtitle="Información de tu cuenta"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Avatar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {getInitials(user.name || "Usuario")}
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-primary">{user.name || "Usuario"}</p>
              <Badge variant="outline" className="mt-2">
                {user.role.name === "SUPERADMIN" ? "Superadministrador" : user.role.name}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User size={16} />
                  Nombre Completo
                </Label>
                <Input id="name" value={user.name || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail size={16} />
                  Correo Electrónico
                </Label>
                <Input id="email" value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield size={16} />
                  Rol
                </Label>
                <Input
                  id="role"
                  value={user.role.name === "SUPERADMIN" ? "Superadministrador" : user.role.name}
                  disabled
                />
              </div>

              {user.role.name === "ADMINISTRADOR" && (
                <div className="space-y-2">
                  <Label htmlFor="invitationLimit" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Límite de Invitaciones
                  </Label>
                  <Input
                    id="invitationLimit"
                    value={user.invitationLimit || 0}
                    disabled
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Para actualizar tu información, contacta al administrador del sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
