"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Save, X, Loader2, RefreshCw, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { InviteUserModal } from "./InviteUserModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        variant: "default" | "destructive";
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
        variant: "default",
    });

    const isSuperAdmin = currentUser?.role?.name === "SUPERADMIN" || currentUser?.platformRole === "SUPER_ADMIN";
    const isAdmin = currentUser?.role?.name === "ADMINISTRADOR";
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

    // Calculate remaining invitations for Admin (count both PENDING and ACCEPTED as occupied seats)
    const occupiedSeats = invitations.filter(inv => inv.status === "PENDING" || inv.status === "ACCEPTED").length;
    const remainingInvitations = isAdmin
        ? (currentUser?.invitationLimit || 0) - occupiedSeats
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
            setUsers(prev => prev.map(u =>
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

    const handleDeleteUser = (userId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "¿Eliminar usuario?",
            description: "Esta acción no se puede deshacer. El usuario perderá el acceso al sistema inmediatamente.",
            variant: "destructive",
            onConfirm: () => executeDeleteUser(userId),
        });
    };

    const executeDeleteUser = async (userId: string) => {
        setIsProcessingAction(true);
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(data.error || "Error al eliminar usuario");
                return;
            }

            setUsers(prev => prev.filter(u => u.id !== userId));
            toast.success("Usuario eliminado");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Error al eliminar usuario");
        } finally {
            setIsProcessingAction(false);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleDeleteInvitation = (invitationId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "¿Cancelar invitación?",
            description: "El enlace de invitación dejará de funcionar y el cupo se liberará.",
            variant: "destructive",
            onConfirm: () => executeDeleteInvitation(invitationId),
        });
    };

    const executeDeleteInvitation = async (invitationId: string) => {
        setIsProcessingAction(true);
        try {
            const response = await fetch(`/api/invitations/${invitationId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(data.error || "Error al cancelar invitación");
                return;
            }

            setInvitations(prev => prev.filter(i => i.id !== invitationId));
            toast.success("Invitación cancelada");
        } catch (error) {
            console.error("Error deleting invitation:", error);
            toast.error("Error al cancelar invitación");
        } finally {
            setIsProcessingAction(false);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
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
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h3 className="font-black text-[#1e3a5f] flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Gestión de Usuarios
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                        Administra accesos, roles e invitaciones del sistema
                        {isAdmin && (
                            <span className="ml-1 text-[#1e3a5f] font-bold">
                                • {remainingInvitations} cupos libres
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="rounded-xl border-gray-200 h-10 w-10 flex-shrink-0"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin text-primary" : "text-[#1e3a5f]"} />
                    </Button>
                    <Button
                        onClick={handleInviteClick}
                        className="flex-1 sm:flex-none gap-2 bg-[#1e3a5f] text-white rounded-xl h-10 font-bold px-6 shadow-lg shadow-blue-900/10 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isAdmin && remainingInvitations <= 0}
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Invitar Usuario</span>
                        <span className="sm:hidden">Invitar</span>
                    </Button>
                </div>
            </div>

            {/* Tabs - Styled like main config tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full sm:w-fit overflow-x-auto">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "active"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Usuarios Activos ({filteredUsers.length})
                </button>
                <button
                    onClick={() => setActiveTab("invited")}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "invited"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Invitaciones ({invitationsToShow.length})
                </button>
            </div>

            {/* Search and Filters */}
            <div className="relative group max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Buscar por nombre o email..."
                    className="pl-10 h-11 bg-white border-gray-100 rounded-xl focus:ring-primary/10 transition-all text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {activeTab === "active" ? (
                    <>
                        {/* Mobile View: Cards */}
                        <div className="lg:hidden divide-y divide-gray-50">
                            {paginatedUsers.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-bold">No se encontraron usuarios</p>
                                </div>
                            ) : (
                                paginatedUsers.map((u) => (
                                    <div key={u.id} className="p-4 hover:bg-gray-50/50 transition-colors space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a5f] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    {editingUserId === u.id ? (
                                                        <Input
                                                            value={editForm.name ?? ""}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="h-8 text-xs font-bold p-1"
                                                        />
                                                    ) : (
                                                        <p className="font-bold text-[#1e3a5f] text-sm truncate">{u.name || "Sin nombre"}</p>
                                                    )}
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {editingUserId === u.id ? (
                                                    <>
                                                        <button onClick={() => handleSaveUser(u.id)} disabled={isSaving} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg">
                                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                        </button>
                                                        <button onClick={() => setEditingUserId(null)} className="p-2 text-red-600 bg-red-50 rounded-lg">
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditUser(u.id)} className="p-2 text-primary bg-blue-50 rounded-lg">
                                                            <Pencil size={16} />
                                                        </button>
                                                        {(isSuperAdmin || isAdmin) && u.role.name !== "SUPERADMIN" && u.id !== currentUser?.id && (
                                                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 bg-red-50 rounded-lg">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pb-2">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase block">Rol</span>
                                                <Badge variant="outline" className="text-[10px] py-0 h-5 border-blue-100 text-blue-700 bg-blue-50/50">{u.role.name}</Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase block">Estado</span>
                                                <Badge variant={u.isActive ? "default" : "destructive"} className={`text-[10px] py-0 h-5 ${u.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                                                    {u.isActive ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </div>
                                            {isSuperAdmin && (
                                                <>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Invitado por</span>
                                                        <span className="text-[10px] font-bold text-gray-600 truncate block">
                                                            {u.invitedBy ? u.invitedBy.email.split('@')[0] : "-"}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Tope Invit.</span>
                                                        {editingUserId === u.id ? (
                                                            <input
                                                                type="number"
                                                                value={editForm.invitationLimit}
                                                                onChange={(e) => setEditForm({ ...editForm, invitationLimit: parseInt(e.target.value) || 0 })}
                                                                className="w-12 text-[10px] font-bold border rounded outline-none"
                                                            />
                                                        ) : (
                                                            <span className="text-[10px] font-black text-[#1e3a5f]">{u.invitationLimit}</span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr className="border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rol</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                                        {isSuperAdmin && <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Invitado por</th>}
                                        {isSuperAdmin && <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Tope</th>}
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-blue-50/10 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3a5f] to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                        {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        {editingUserId === u.id ? (
                                                            <div className="space-y-1">
                                                                <Input
                                                                    value={editForm.name ?? ""}
                                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                    className="h-8 text-xs font-bold w-48"
                                                                />
                                                                <Input
                                                                    value={editForm.email ?? ""}
                                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                                    className="h-8 text-[10px] w-48"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="font-bold text-[#1e3a5f] text-sm group-hover:text-primary transition-colors">{u.name || "Sin nombre"}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium">{u.email}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="capitalize text-[10px] font-bold border-blue-100 text-[#1e3a5f] bg-blue-50/30">
                                                    {u.role.name}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant={u.isActive ? "default" : "destructive"} className={`text-[10px] font-bold ${u.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}>
                                                    {u.isActive ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-medium text-gray-500">
                                                        {u.invitedBy ? (u.invitedBy.name || u.invitedBy.email) : (u.role.name === "SUPERADMIN" ? "-" : "Autoregistro")}
                                                    </span>
                                                </td>
                                            )}
                                            {isSuperAdmin && (
                                                <td className="px-6 py-4 text-center">
                                                    {u.role.name === "ADMINISTRADOR" ? (
                                                        editingUserId === u.id ? (
                                                            <Input
                                                                type="number"
                                                                value={editForm.invitationLimit ?? 0}
                                                                onChange={(e) => setEditForm({ ...editForm, invitationLimit: parseInt(e.target.value) || 0 })}
                                                                className="w-16 h-8 text-center text-xs font-bold border-gray-200 mx-auto"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-black text-[#1e3a5f]">{u.invitationLimit}</span>
                                                        )
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    {editingUserId === u.id ? (
                                                        <>
                                                            <button onClick={() => handleSaveUser(u.id)} disabled={isSaving} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl">
                                                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                            </button>
                                                            <button onClick={() => setEditingUserId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEditUser(u.id)} className="p-2 text-primary hover:bg-blue-50 rounded-xl">
                                                                <Pencil size={16} />
                                                            </button>
                                                            {(isSuperAdmin || isAdmin) && u.role.name !== "SUPERADMIN" && u.id !== currentUser?.id && (
                                                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mobile View: Invitation Cards */}
                        <div className="lg:hidden divide-y divide-gray-50">
                            {paginatedInvitations.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Plus size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-bold">Sin invitaciones pendientes</p>
                                </div>
                            ) : (
                                paginatedInvitations.map((inv) => (
                                    <div key={inv.id} className="p-4 hover:bg-gray-50/50 transition-colors space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-[#1e3a5f] text-sm truncate">{inv.email}</p>
                                                <Badge variant="outline" className="mt-1 text-[9px] h-4 leading-none border-blue-100 text-blue-600">{inv.role.name}</Badge>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge className={`text-[10px] py-0 h-5 ${inv.status === 'PENDING' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}`}>
                                                    {inv.status === 'PENDING' ? 'Pendiente' : 'Expirada'}
                                                </Badge>
                                                {inv.status === 'PENDING' && (
                                                    <button onClick={() => handleDeleteInvitation(inv.id)} className="p-2 text-red-400 bg-red-50/50 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-left">Por: {inv.inviter?.name || inv.inviter?.email.split('@')[0]}</span>
                                            <span className="text-[9px] font-medium text-gray-400">Hace {Math.floor((Date.now() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24))} días</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View: Invitations Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr className="border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Email Invitado</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rol Asignado</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Invitado por</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedInvitations.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-amber-50/10 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#1e3a5f] text-sm">{inv.email}</p>
                                                <p className="text-[9px] text-gray-400 font-medium">Enviada el {new Date(inv.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="text-[10px] font-bold border-blue-100 text-[#1e3a5f]">
                                                    {inv.role.name}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge className={`text-[10px] font-bold ${inv.status === 'PENDING' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-400'}`}>
                                                    {inv.status === 'PENDING' ? 'Pendiente' : 'Expirada'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-medium text-gray-500">
                                                    {inv.inviter?.name || inv.inviter?.email}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {inv.status === "PENDING" && (
                                                    <button
                                                        onClick={() => handleDeleteInvitation(inv.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Cancelar invitación"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Unified Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-50 bg-gray-50/30 gap-4">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de {totalItems}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 rounded-xl border-gray-200 text-[#1e3a5f] font-bold hover:bg-white disabled:opacity-40"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} className="mr-1" /> Anterior
                            </Button>
                            <div className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-[#1e3a5f] min-w-[32px] text-center shadow-sm">
                                {currentPage}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 rounded-xl border-gray-200 text-[#1e3a5f] font-bold hover:bg-white disabled:opacity-40"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            <InviteUserModal
                open={isInviteModalOpen}
                onOpenChange={setIsInviteModalOpen}
                onInviteSuccess={handleInviteSuccess}
                isSuperAdmin={isSuperAdmin}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                description={confirmConfig.description}
                variant={confirmConfig.variant}
                isLoading={isProcessingAction}
                confirmText={confirmConfig.variant === "destructive" ? "Eliminar" : "Confirmar"}
            />
        </div>
    );
}
