"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Save, X, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { InviteUserModal } from "./InviteUserModal";

interface User {
    id: string;
    email: string;
    name: string | null;
    isActive: boolean;
    role: {
        id: string;
        name: string;
    };
    invitationLimit: number;
    invitedBy?: {
        name: string | null;
        email: string;
    } | null;
}

interface Invitation {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    role: {
        id: string;
        name: string;
    };
    inviter: {
        id: string;
        name: string | null;
        email: string;
    };
}

export function UsersManager() {
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"active" | "invited">("active");
    const [users, setUsers] = useState<User[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", invitationLimit: 0 });
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const isSuperAdmin = currentUser?.role.name === "SUPERADMIN";
    const isAdmin = currentUser?.role.name === "ADMINISTRADOR";
    const canAccessUsers = isSuperAdmin || isAdmin;

    // Fetch users from API
    const fetchUsers = useCallback(async () => {
        try {
            const url = isSuperAdmin ? "/api/users?showSuperAdmin=true" : "/api/users";
            const response = await fetch(url);
            const data = await response.json();
            if (data.success && data.data) {
                setUsers(data.data.users || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error al cargar usuarios");
        }
    }, []);

    // Fetch invitations from API
    const fetchInvitations = useCallback(async () => {
        try {
            const url = isAdmin && currentUser?.id
                ? `/api/invitations?inviterId=${currentUser.id}`
                : "/api/invitations";

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setInvitations(data.data);
            }
        } catch (error) {
            console.error("Error fetching invitations:", error);
            toast.error("Error al cargar invitaciones");
        }
    }, [isAdmin, currentUser?.id]);

    // Initial data load
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            await Promise.all([fetchUsers(), fetchInvitations()]);
            setIsLoading(false);
        }

        if (canAccessUsers) {
            loadData();
        }
    }, [canAccessUsers, fetchUsers, fetchInvitations]);

    // Calculate remaining invitations for Admin
    const pendingInvitations = invitations.filter(inv => inv.status === "PENDING").length;
    const remainingInvitations = isAdmin
        ? (currentUser?.invitationLimit || 0) - pendingInvitations
        : Infinity;

    // Filter users
    const filteredUsers = users.filter(u => {
        const searchLower = searchTerm.toLowerCase();
        return (u.name?.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower));
    });

    // Reset page when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const invitationsToShow = invitations.filter(i => i.status !== "ACCEPTED");

    // Pagination logic
    const totalItems = activeTab === "active" ? filteredUsers.length : invitationsToShow.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const paginatedInvitations = invitationsToShow.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleEditUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setEditingUserId(userId);
            setEditForm({
                name: user.name || "",
                email: user.email,
                invitationLimit: user.invitationLimit ?? 0
            });
        }
    };

    const handleSaveUser = async (userId: string) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editForm.name,
                    email: editForm.email,
                    invitationLimit: editForm.invitationLimit,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(data.error || "Error al actualizar usuario");
                return;
            }

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, name: editForm.name, email: editForm.email, invitationLimit: editForm.invitationLimit } : u
            ));
            setEditingUserId(null);
            toast.success("Usuario actualizado correctamente");
        } catch (error) {
            console.error("Error saving user:", error);
            toast.error("Error al guardar cambios");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(data.error || "Error al eliminar usuario");
                return;
            }

            setUsers(users.filter(u => u.id !== userId));
            toast.success("Usuario eliminado");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Error al eliminar usuario");
        }
    };

    const handleDeleteInvitation = async (invitationId: string) => {
        if (!confirm("¿Cancelar esta invitación?")) {
            return;
        }

        try {
            const response = await fetch(`/api/invitations/${invitationId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(data.error || "Error al cancelar invitación");
                return;
            }

            setInvitations(invitations.filter(i => i.id !== invitationId));
            toast.success("Invitación cancelada");
        } catch (error) {
            console.error("Error deleting invitation:", error);
            toast.error("Error al cancelar invitación");
        }
    };

    const handleInviteClick = () => {
        if (isAdmin && remainingInvitations <= 0) {
            toast.error("Has alcanzado el límite de invitaciones permitidas");
            return;
        }
        setIsInviteModalOpen(true);
    };

    const handleInviteSuccess = () => {
        fetchInvitations();
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        await Promise.all([fetchUsers(), fetchInvitations()]);
        setIsLoading(false);
        toast.success("Datos actualizados");
    };

    if (!canAccessUsers) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">No tienes permisos para acceder a esta sección</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                                - Invitaciones disponibles: {remainingInvitations}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                    <Button
                        onClick={handleInviteClick}
                        className="gap-2"
                        disabled={isAdmin && remainingInvitations <= 0}
                    >
                        <Plus size={16} /> Invitar Usuario
                        {isAdmin && ` (${remainingInvitations})`}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "active" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Usuarios Activos ({filteredUsers.length})
                </button>
                <button
                    onClick={() => setActiveTab("invited")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "invited" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Invitaciones ({invitationsToShow.length})
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
                            {/* Header */}
                            <div className="overflow-x-auto">
                                <div className={`grid gap-4 p-4 font-medium text-sm text-muted-foreground border-b bg-muted/50 min-w-[1000px] ${isSuperAdmin ? 'grid-cols-12' : 'grid-cols-10'}`}>
                                    <div className="col-span-2">Nombre</div>
                                    <div className="col-span-2">Email</div>
                                    <div className="col-span-2">Rol</div>
                                    <div className="col-span-1">Estado</div>
                                    {isSuperAdmin && <div className="col-span-2">Invitado por</div>}
                                    {isSuperAdmin && <div className="col-span-1">Tope</div>}
                                    <div className="col-span-2 text-right px-4">Acciones</div>
                                </div>

                                {/* Rows */}
                                {filteredUsers.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No se encontraron usuarios
                                    </div>
                                ) : (
                                    paginatedUsers.map((u) => (
                                        <div key={u.id} className={`grid gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/5 min-w-[1000px] ${isSuperAdmin ? 'grid-cols-12' : 'grid-cols-10'}`}>
                                            <div className="col-span-2">
                                                {editingUserId === u.id ? (
                                                    <Input
                                                        value={editForm.name ?? ""}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="h-8"
                                                    />
                                                ) : (
                                                    <div className="font-medium text-sm">{u.name || "Sin nombre"}</div>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                {editingUserId === u.id ? (
                                                    <Input
                                                        value={editForm.email ?? ""}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="h-8"
                                                    />
                                                ) : (
                                                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <Badge variant="outline" className="capitalize">
                                                    {u.role.name}
                                                </Badge>
                                            </div>
                                            <div className="col-span-1">
                                                <Badge variant={u.isActive ? "default" : "destructive"} className={u.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 px-1.5" : "px-1.5"}>
                                                    {u.isActive ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </div>

                                            {isSuperAdmin && (
                                                <div className="col-span-2 text-xs text-muted-foreground truncate">
                                                    {u.invitedBy ? (u.invitedBy.name || u.invitedBy.email) : (u.role.name === "SUPERADMIN" ? "-" : "Sistema/Seed")}
                                                </div>
                                            )}

                                            {isSuperAdmin && (
                                                <div className="col-span-1">
                                                    {u.role.name === "ADMINISTRADOR" ? (
                                                        editingUserId === u.id ? (
                                                            <Input
                                                                type="number"
                                                                value={editForm.invitationLimit ?? 0}
                                                                onChange={(e) => setEditForm({ ...editForm, invitationLimit: parseInt(e.target.value) || 0 })}
                                                                className="w-16 h-8"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-medium">{u.invitationLimit}</span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="col-span-2 flex justify-end gap-1 px-2">
                                                {editingUserId === u.id ? (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleSaveUser(u.id)}
                                                            disabled={isSaving}
                                                            title="Guardar"
                                                        >
                                                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingUserId(null)} title="Cancelar">
                                                            <X size={14} />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEditUser(u.id)} title="Editar">
                                                            <Pencil size={14} />
                                                        </Button>
                                                        {isSuperAdmin && u.role.name !== "SUPERADMIN" && (
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteUser(u.id)} title="Eliminar">
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b bg-muted/50">
                                <div className="col-span-4">Email</div>
                                <div className="col-span-2">Rol</div>
                                <div className="col-span-2">Estado</div>
                                <div className="col-span-2">Invitado por</div>
                                <div className="col-span-2">Acciones</div>
                            </div>

                            {/* Rows */}
                            {invitationsToShow.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No hay invitaciones pendientes
                                </div>
                            ) : (
                                paginatedInvitations.map((inv) => (
                                    <div key={inv.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
                                        <div className="col-span-4 font-medium text-sm">{inv.email}</div>
                                        <div className="col-span-2">
                                            <Badge variant="outline">{inv.role.name}</Badge>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${inv.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                                inv.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                                                    "bg-red-100 text-red-800"
                                                }`}>
                                                {inv.status === "PENDING" ? "Pendiente" : inv.status === "ACCEPTED" ? "Activa" : "Expirada"}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-sm text-muted-foreground">
                                            {inv.inviter?.name || inv.inviter?.email || "-"}
                                        </div>
                                        <div className="col-span-2">
                                            {inv.status === "PENDING" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteInvitation(inv.id)}
                                                >
                                                    <Trash2 size={14} className="mr-1" /> Cancelar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                            <div className="text-xs text-muted-foreground">
                                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de {totalItems} registros
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <div className="text-xs font-medium px-2">
                                    Página {currentPage} de {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
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
