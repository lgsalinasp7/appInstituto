"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, UserCheck, Save, Loader2 } from "lucide-react";
import { type User } from "@/modules/users";
import { toast } from "sonner";
import { format } from "date-fns";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { TablePagination } from "@/components/ui/table-pagination";

interface UsersClientProps {
    initialUsers: User[];
    initialInvitations: any[]; // Using any for now to match structure, can be typed strictly
}

export default function UsersClient({ initialUsers, initialInvitations }: UsersClientProps) {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"users" | "invitations">("users");
    const { user: currentUser } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState(initialUsers);

    // useEffect-1: handle hydration (mounted pattern)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter Users: Hide SUPERADMIN and apply search
    const filteredUsers = users.filter(u => {
        if (u.role?.name.toLowerCase() === "superadmin") return false;
        const searchLower = searchTerm.toLowerCase();
        return u.name?.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower);
    });
    const filteredInvitations = initialInvitations.filter((inv) => {
        const searchLower = searchTerm.toLowerCase();
        return inv.email.toLowerCase().includes(searchLower);
    });

    const {
        page: usersPage,
        totalPages: usersTotalPages,
        totalItems: usersTotalItems,
        pageSize: usersPageSize,
        paginatedItems: paginatedUsers,
        setPage: setUsersPage,
        resetPage: resetUsersPage,
    } = useTablePagination(filteredUsers, 6);

    const {
        page: invitationsPage,
        totalPages: invitationsTotalPages,
        totalItems: invitationsTotalItems,
        pageSize: invitationsPageSize,
        paginatedItems: paginatedInvitations,
        setPage: setInvitationsPage,
        resetPage: resetInvitationsPage,
    } = useTablePagination(filteredInvitations, 6);

    useEffect(() => {
        if (activeTab === "users") {
            resetUsersPage();
        } else {
            resetInvitationsPage();
        }
    }, [searchTerm, activeTab, resetUsersPage, resetInvitationsPage]);

    const canInvite = currentUser?.role?.name === "SUPERADMIN" || (currentUser?.role?.name === "ADMINISTRADOR" && (currentUser?.invitationLimit || 0) > 0);
    const isSuperAdmin = currentUser?.role?.name === "SUPERADMIN";

    const handleLimitChange = (userId: string, newLimit: string) => {
        const limit = parseInt(newLimit);
        if (isNaN(limit) || limit < 0) return;

        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, invitationLimit: limit } : u
        ));
    };

    const handleSaveLimit = (userId: string) => {
        // TODO: Connect to backend update (Server Action)
        toast.success("Límite de invitaciones actualizado");
    };

    // Prevent hydration mismatch by only rendering full UI on client
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin opacity-20" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in-up">
            {/* Header */}
            <DashboardHeader
                title="Gestión de"
                titleHighlight="Usuarios"
                subtitle="Administra los accesos y privilegios del ecosistema."
            >
                {canInvite && (
                    <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-all rounded-2xl px-8 py-7 font-bold shadow-[0_0_30px_rgba(8,145,178,0.3)] border border-white/10">
                        <Plus className="mr-2 h-6 w-6" /> Invitar nuevo usuario
                    </Button>
                )}
            </DashboardHeader>

            {/* Tabs & Search Unified Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex p-1 bg-slate-900/50 border border-slate-800/50 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                            activeTab === "users"
                                ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_10px_rgba(20,184,166,0.1)]"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <UserCheck className="w-4 h-4" />
                        Usuarios Activos
                        <span className="ml-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px]">{filteredUsers.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("invitations")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                            activeTab === "invitations"
                                ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_10px_rgba(20,184,166,0.1)]"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Mail className="w-4 h-4" />
                        Invitaciones
                        <span className="ml-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px]">{filteredInvitations.length}</span>
                    </button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        className="pl-11 pr-4 py-6 bg-slate-950/50 border-slate-800/50 rounded-2xl w-full lg:w-80 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden">
                {activeTab === "users" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Usuario</th>
                                    <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Rol</th>
                                    <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
                                    {isSuperAdmin && <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Límite Invitaciones</th>}
                                    <th className="px-8 py-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30 font-medium">
                                {paginatedUsers.map((u) => (
                                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-cyan-400 font-bold">
                                                    {u.name?.charAt(0) || u.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm text-white group-hover:text-cyan-400 transition-colors">{u.name || "Sin nombre"}</div>
                                                    <div className="text-xs text-slate-500 font-normal">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
                                                {u.role?.name || "Sin Rol"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                                    u.isActive ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-400"
                                                )} />
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    u.isActive ? "text-green-400" : "text-red-400"
                                                )}>
                                                    {u.isActive ? "En línea" : "Inactivo"}
                                                </span>
                                            </div>
                                        </td>

                                        {isSuperAdmin && (
                                            <td className="px-6 py-5">
                                                {u.role?.name.toUpperCase() === "ADMINISTRADOR" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="w-16 h-9 bg-slate-900/50 border-slate-800 text-center text-sm rounded-lg focus:border-cyan-500/50 focus:ring-0"
                                                            value={u.invitationLimit || 0}
                                                            onChange={(e) => handleLimitChange(u.id, e.target.value)}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                            onClick={() => handleSaveLimit(u.id)}
                                                        >
                                                            <Save size={16} />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-600 ml-4 font-normal">-</span>
                                                )}
                                            </td>
                                        )}

                                        <td className="px-8 py-5 text-right">
                                            <Button variant="ghost" className="text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl">
                                                Gestionar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="py-20 text-center bg-slate-950/20">
                                <Search className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                                <p className="text-slate-500">No se encontraron usuarios que coincidan con la búsqueda.</p>
                            </div>
                        )}
                        <TablePagination
                            page={usersPage}
                            totalPages={usersTotalPages}
                            totalItems={usersTotalItems}
                            pageSize={usersPageSize}
                            onPageChange={setUsersPage}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Email Destinatario</th>
                                    <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Rol Asignado</th>
                                    <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
                                    <th className="px-8 py-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Fecha de Envío</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30 font-medium">
                                {paginatedInvitations.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                                                    <Mail className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="text-sm text-slate-200 group-hover:text-white transition-colors">
                                                    {inv.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-400 uppercase tracking-tight">
                                                {inv.role?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                                                inv.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    inv.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' :
                                                        'bg-slate-500/10 text-slate-500'
                                            )}>
                                                {inv.status === 'PENDING' ? 'Pendiente' : inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-xs text-slate-500 font-normal">
                                                {format(new Date(inv.createdAt), "dd MMM, yyyy")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredInvitations.length === 0 && (
                            <div className="py-20 text-center bg-slate-950/20">
                                <Mail className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                                <p className="text-slate-500">No hay invitaciones registradas en el sistema.</p>
                            </div>
                        )}
                        <TablePagination
                            page={invitationsPage}
                            totalPages={invitationsTotalPages}
                            totalItems={invitationsTotalItems}
                            pageSize={invitationsPageSize}
                            onPageChange={setInvitationsPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
