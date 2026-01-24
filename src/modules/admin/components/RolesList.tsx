"use client";

/**
 * Roles List Component
 * Displays a list of system roles
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Role } from "../types";

interface RolesListProps {
  roles: Role[];
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RolesList({ roles, onEdit, onDelete }: RolesListProps) {
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <Card key={role.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{role.name}</CardTitle>
              <CardDescription>
                {role.description || "Sin descripción"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {role._count?.users || 0} usuarios
              </Badge>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(role)}>
                  Editar
                </Button>
              )}
              {onDelete && role.name !== "admin" && role.name !== "user" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(role)}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
