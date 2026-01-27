"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { InviteUserModal } from "./InviteUserModal";

// Mock Data - Replace with actual API calls
const initialMockUsers = [
    {
        id: "1",
        email: "admin@instituto.edu.co",
        name: "Administrador",
        isActive: true,
        role: "ADMINISTRADOR",
        invitationLimit: 10,
    },
    {
        id: "2",
        email: "maria.gonzalez@instituto.edu.co",
        name: "María González",
        isActive: true,
        role: "VENTAS",
        invitationLimit: 0,
    },
    {
        id: "3",
        email: "carlos.rodriguez@instituto.edu.co",
        name: "Carlos Rodríguez",
        isActive: true,
        role: "VENTAS",
        invitationLimit: 0,
    },
];

const initialMockInvitations = [
    { id: "101", email: "newuser@gmail.com", role: "VENTAS", status: "PENDING", createdAt: "2026-01-21" },
    { id: "102", email: "support@kaled.com", role: "CARTERA", status: "PENDING", createdAt: "2026-01-22" },
];

export function UsersManager() {
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"active" | "invited">("active");
    const [users, setUsers] = useState(initialMockUsers);
    const [invitations, setInvitations] = useState(initialMockInvitations);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", invitationLimit: 0 });
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const isSuperAdmin = currentUser?.role.name === "SUPERADMIN";
    const isAdmin = currentUser?.role.name === "ADMINISTRADOR";
    const canAccessUsers = isSuperAdmin || isAdmin;

    // Calculate remaining invitations for Admin
    const remainingInvitations = isAdmin
        ? (currentUser?.invitationLimit || 0) - invitations.filter(inv => inv.status === "PENDING").length
        : Infinity;

    // Filter users
    const filteredUsers = users.filter(u => {
        const searchLower = searchTerm.toLowerCase();
        return u.name?.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower);
    });

    const handleEditUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setEditingUserId(userId);
            setEditForm({ name: user.name, invitationLimit: user.invitationLimit });
        }
    };

    const handleSaveUser = (userId: string) => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, name: editForm.name, invitationLimit: editForm.invitationLimit } : u
        ));
        setEditingUserId(null);
        toast.success("Usuario actualizado correctamente");
    };

    const handleDeleteUser = (userId: string) => {
        if (confirm("¿Estás seguro de eliminar este usuario?")) {
            setUsers(users.filter(u => u.id !== userId));
            toast.success("Usuario eliminado");
        }
    };

    const handleDeleteInvitation = (invitationId: string) => {
        if (confirm("¿Cancelar esta invitación?")) {
            setInvitations(invitations.filter(i => i.id !== invitationId));
            toast.success("Invitación cancelada");
        }
    };

    const handleInviteClick = () => {
        // Check if Admin has reached invitation limit
        if (isAdmin && remainingInvitations <= 0) {
            toast.error("Has alcanzado el límite de invitaciones permitidas");
            return;
        }
        setIsInviteModalOpen(true);
    };

    const handleInviteSuccess = () => {
        // Refresh invitations list
        // TODO: Fetch from API
        toast.info("Lista de invitaciones actualizada");
    };

    if (!canAccessUsers) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">No tienes permisos para acceder a esta sección</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-primary">Gestión de Usuarios</h3>
                    <p className="text-sm text-muted-foreground">
                        Administra usuarios activos e invitaciones
                        {isAdmin && (
                            <span className="ml-2 text-primary font-medium">
                                • Invitaciones disponibles: {remainingInvitations}
                            </span>
                        )}
                    </p>
                </div>
                {canAccessUsers && (
                    <Button
                        onClick={handleInviteClick}
                        className="gap-2"
                        disabled={isAdmin && remainingInvitations <= 0}
                    >
                        <Plus size={16} /> Invitar Usuario
                        {isAdmin && ` (${remainingInvitations})`}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "active" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Usuarios Activos ({filteredUsers.length})
                </button>
                <button
                    onClick={() => setActiveTab("invited")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "invited" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Invitaciones ({invitations.length})
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content */}
            <Card>
                <CardContent className="p-0">
                    {activeTab === "active" ? (
                        <div className="rounded-md border">
                            {/* Header */}
                            <div className={`grid gap-4 p-4 font-medium text-sm text-muted-foreground border-b bg-muted/50 ${isSuperAdmin ? 'grid-cols-12' : 'grid-cols-10'}`}>
                                <div className="col-span-3">Usuario</div>
                                <div className="col-span-2">Rol</div>
                                <div className="col-span-2">Estado</div>
                                {isSuperAdmin && <div className="col-span-2">Límite Inv.</div>}
                                <div className="col-span-3">Acciones</div>
                            </div>

                            {/* Rows */}
                            {filteredUsers.map((u) => (
                                <div key={u.id} className={`grid gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/5 ${isSuperAdmin ? 'grid-cols-12' : 'grid-cols-10'}`}>
                                    <div className="col-span-3">
                                        {editingUserId === u.id ? (
                                            <Input
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="h-8"
                                            />
                                        ) : (
                                            <>
                                                <div className="font-medium text-sm">{u.name}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant="outline" className="capitalize">
                                            {u.role}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant={u.isActive ? "default" : "destructive"} className={u.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                                            {u.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </div>

                                    {isSuperAdmin && (
                                        <div className="col-span-2">
                                            {u.role === "ADMINISTRADOR" ? (
                                                editingUserId === u.id ? (
                                                    <Input
                                                        type="number"
                                                        value={editForm.invitationLimit}
                                                        onChange={(e) => setEditForm({ ...editForm, invitationLimit: parseInt(e.target.value) || 0 })}
                                                        className="w-20 h-8"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium">{u.invitationLimit}</span>
                                                )
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="col-span-3 flex gap-2">
                                        {editingUserId === u.id ? (
                                            <>
                                                <Button size="sm" variant="ghost" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleSaveUser(u.id)}>
                                                    <Save size={14} className="mr-1" /> Guardar
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingUserId(null)}>
                                                    <X size={14} className="mr-1" /> Cancelar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" variant="ghost" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEditUser(u.id)}>
                                                    <Pencil size={14} className="mr-1" /> Editar
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteUser(u.id)}>
                                                    <Trash2 size={14} className="mr-1" /> Eliminar
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b bg-muted/50">
                                <div className="col-span-5">Email</div>
                                <div className="col-span-3">Rol</div>
                                <div className="col-span-2">Estado</div>
                                <div className="col-span-2">Acciones</div>
                            </div>

                            {/* Rows */}
                            {invitations.map((inv) => (
                                <div key={inv.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
                                    <div className="col-span-5 font-medium">{inv.email}</div>
                                    <div className="col-span-3">
                                        <Badge variant="outline">{inv.role}</Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                                            {inv.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteInvitation(inv.id)}>
                                            <Trash2 size={14} className="mr-1" /> Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invite Modal */}
            <InviteUserModal
                open={isInviteModalOpen}
                onOpenChange={setIsInviteModalOpen}
                onInviteSuccess={handleInviteSuccess}
                isSuperAdmin={isSuperAdmin}
            />
        </div>
    );
}
