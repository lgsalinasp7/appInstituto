"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Trash2, Edit } from "lucide-react";

// Mock Roles
const initialRoles = [
    { id: "1", name: "ADMINISTRADOR", description: "Acceso total al sistema", permissions: ["all"] },
    { id: "2", name: "VENTAS", description: "Gestión comercial y matrículas", permissions: ["dashboard.view", "enrollment.manage"] },
    { id: "3", name: "CARTERA", description: "Gestión de cobros y recaudos", permissions: ["dashboard.view", "payments.manage"] },
    { id: "4", name: "USER", description: "Usuario estándar", permissions: ["profile.view"] },
];

export default function RolesConfigPage() {
    const [roles, setRoles] = useState(initialRoles);
    const [newRoleName, setNewRoleName] = useState("");

    const handleCreateRole = () => {
        if (!newRoleName) return;
        const newRole = {
            id: Math.random().toString(36).substr(2, 9),
            name: newRoleName.toUpperCase(),
            description: "Rol personalizado",
            permissions: []
        };
        setRoles([...roles, newRole]);
        setNewRoleName("");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Configuración de Roles</h2>
                    <p className="text-muted-foreground">Define roles dinámicos y sus permisos</p>
                </div>
            </div>

            {/* Create Role */}
            <Card>
                <CardHeader>
                    <CardTitle>Crear Nuevo Rol</CardTitle>
                    <CardDescription>Agrega un nuevo rol al sistema para asignar permisos específicos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="Nombre del rol (ej. SECRETARIA)"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            className="max-w-md"
                        />
                        <Button onClick={handleCreateRole} disabled={!newRoleName}>
                            <Plus size={16} className="mr-2" />
                            Crear Rol
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Roles List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                    <Card key={role.id} className="relative group">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle>{role.name}</CardTitle>
                                    <CardDescription>{role.description}</CardDescription>
                                </div>
                                <Shield className="text-muted-foreground/20 group-hover:text-primary/20 transition-colors" size={40} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Permisos</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {role.permissions.map(p => (
                                            <Badge key={p} variant="secondary" className="text-xs">
                                                {p}
                                            </Badge>
                                        ))}
                                        {role.permissions.length === 0 && <span className="text-xs text-muted-foreground italic">Sin permisos asignados</span>}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Edit size={14} />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
