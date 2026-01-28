"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, UserCheck, Save } from "lucide-react";
import { type User } from "@/modules/users";
import { toast } from "sonner";
import { format } from "date-fns";

interface UsersClientProps {
    initialUsers: User[];
    initialInvitations: any[]; // Using any for now to match structure, can be typed strictly
}

export default function UsersClient({ initialUsers, initialInvitations }: UsersClientProps) {
    const [activeTab, setActiveTab] = useState<"users" | "invitations">("users");
    const { user: currentUser } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState(initialUsers);

    // Filter Users: Hide SUPERADMIN and apply search
    const filteredUsers = users.filter(u => {
        if (u.role?.name.toLowerCase() === "superadmin") return false;
        const searchLower = searchTerm.toLowerCase();
        return u.name?.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower);
    });

    const canInvite = currentUser?.role.name === "SUPERADMIN" || (currentUser?.role.name === "ADMINISTRADOR" && (currentUser?.invitationLimit || 0) > 0);
    const isSuperAdmin = currentUser?.role.name === "SUPERADMIN";

    const handleLimitChange = (userId: string, newLimit: string) => {
        const limit = parseInt(newLimit);
        if (isNaN(limit) || limit < 0) return;

        setUsers(users.map(u =>
            u.id === userId ? { ...u, invitationLimit: limit } : u
        ));
    };

    const handleSaveLimit = (userId: string) => {
        // TODO: Connect to backend update (Server Action)
        toast.success("Límite de invitaciones actualizado");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Usuarios del Tenant</h2>
                    <p className="text-muted-foreground text-sm">Gestiona el acceso al sistema</p>
                </div>
                {canInvite && (
                    <Button className="gap-2">
                        <Plus size={16} /> Invitar Usuario
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UserCheck size={16} />
                        Usuarios Activos
                        <Badge variant="secondary" className="ml-1 rounded-full">{filteredUsers.length}</Badge>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("invitations")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "invitations" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Invitaciones
                        <Badge variant="secondary" className="ml-1 rounded-full">{initialInvitations.length}</Badge>
                    </div>
                </button>
            </div>

            {/* Content */}
            <Card>
                <CardHeader className="py-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="pl-8 max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {activeTab === "users" ? (
                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b bg-muted/50">
                                <div className="col-span-4">Usuario</div>
                                <div className="col-span-2">Rol</div>
                                <div className="col-span-2">Estado</div>
                                {isSuperAdmin && <div className="col-span-2">Límite Invitaciones</div>}
                                <div className="col-span-2">Acciones</div>
                            </div>
                            {filteredUsers.map((u) => (
                                <div key={u.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/5">
                                    <div className="col-span-4">
                                        <div className="font-medium text-sm">{u.name}</div>
                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                                            {u.role?.name || "Sin Rol"}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant={u.isActive ? "default" : "destructive"} className={u.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                                            {u.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </div>

                                    {isSuperAdmin && (
                                        <div className="col-span-2">
                                            {u.role?.name.toUpperCase() === "ADMINISTRADOR" ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        className="w-16 h-8 text-center"
                                                        value={u.invitationLimit || 0}
                                                        onChange={(e) => handleLimitChange(u.id, e.target.value)}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleSaveLimit(u.id)}
                                                    >
                                                        <Save size={14} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground ml-2">-</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="col-span-2">
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </div>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No se encontraron usuarios.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b bg-muted/50">
                                <div className="col-span-5">Email</div>
                                <div className="col-span-3">Rol Solicitado</div>
                                <div className="col-span-2">Estado</div>
                                <div className="col-span-2">Fecha</div>
                            </div>
                            {initialInvitations.map((inv) => (
                                <div key={inv.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
                                    <div className="col-span-5 font-medium">{inv.email}</div>
                                    <div className="col-span-3">
                                        <Badge variant="outline">{inv.role?.name}</Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                inv.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-sm text-muted-foreground">
                                        {format(new Date(inv.createdAt), "dd/MM/yyyy")}
                                    </div>
                                </div>
                            ))}
                            {initialInvitations.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No hay invitaciones registradas.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
