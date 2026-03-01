"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";

interface InviteUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInviteSuccess?: () => void;
    isSuperAdmin?: boolean;
}

interface RoleOption {
    id: string;
    name: string;
    label: string;
}

const ACADEMY_ROLES = [
    { value: "ACADEMY_STUDENT", label: "Estudiante" },
    { value: "ACADEMY_TEACHER", label: "Profesor" },
    { value: "ACADEMY_ADMIN", label: "Administrador Academia" },
] as const;

export function InviteUserModal({ open, onOpenChange, onInviteSuccess, isSuperAdmin = false }: InviteUserModalProps) {
    const [email, setEmail] = useState("");
    const [roleId, setRoleId] = useState("");
    const [academyRole, setAcademyRole] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const { user } = useAuthStore();
    const isAcademyTenant = user?.tenant?.slug === "kaledacademy";

    // Fetch available roles on mount
    useEffect(() => {
        async function fetchRoles() {
            try {
                const response = await fetch("/api/roles");
                const data = await response.json();
                if (data.success) {
                    if (isAcademyTenant) {
                        const filteredRoles = data.data
                            .filter((r: { name: string }) => ["USUARIO", "ADMINISTRADOR"].includes(r.name.toUpperCase()))
                            .map((r: { id: string; name: string }) => ({
                                id: r.id,
                                name: r.name,
                                label: r.name === "ADMINISTRADOR" ? "Administrador" : "Usuario",
                            }));
                        if (filteredRoles.length === 0 && data.data.length > 0) {
                            setRoles(data.data.map((r: { id: string; name: string }) => ({
                                id: r.id,
                                name: r.name,
                                label: r.name,
                            })));
                        } else {
                            setRoles(filteredRoles);
                        }
                    } else {
                        const allowedRoleNames = isSuperAdmin
                            ? ["VENTAS", "CARTERA", "ADMINISTRADOR"]
                            : ["VENTAS", "CARTERA"];
                        const filteredRoles = data.data
                            .filter((r: { name: string }) => allowedRoleNames.includes(r.name))
                            .map((r: { id: string; name: string }) => ({
                                id: r.id,
                                name: r.name,
                                label: r.name === "ADMINISTRADOR" ? "Administrador" : r.name.charAt(0) + r.name.slice(1).toLowerCase(),
                            }));
                        setRoles(filteredRoles);
                    }
                }
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        }

        if (open) {
            fetchRoles();
        }
    }, [open, isSuperAdmin, isAcademyTenant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Por favor ingresa el correo electrónico");
            return;
        }
        if (isAcademyTenant ? !academyRole : !roleId) {
            toast.error("Por favor selecciona un rol");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Por favor ingresa un email válido");
            return;
        }

        if (!user?.id) {
            toast.error("Error de sesión. Por favor recarga la página");
            return;
        }

        let effectiveRoleId = roleId;
        if (isAcademyTenant) {
            const adminRole = roles.find((r) => r.name.toUpperCase() === "ADMINISTRADOR");
            const userRole = roles.find((r) => r.name.toUpperCase() === "USUARIO");
            effectiveRoleId =
                academyRole === "ACADEMY_ADMIN" && adminRole
                    ? adminRole.id
                    : (userRole || adminRole || roles[0])?.id ?? roleId;
        }

        setIsLoading(true);

        try {
            const body: Record<string, unknown> = {
                email,
                roleId: effectiveRoleId,
                inviterId: user.id,
            };
            if (isAcademyTenant && academyRole) {
                body.academyRole = academyRole;
            }

            const response = await fetch("/api/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!data.success) {
                if (data.code === "LIMIT_REACHED") {
                    toast.error(data.error, {
                        duration: 6000,
                        description: "Contacta a soporte técnico si necesitas más usuarios.",
                    });
                } else {
                    toast.error(data.error || "Error al enviar la invitación");
                }
                return;
            }
            toast.success(`Invitación enviada a ${email}`);
            setEmail("");
            setRoleId("");
            setAcademyRole("");
            onOpenChange(false);
            onInviteSuccess?.();
        } catch (error) {
            console.error("Error sending invitation:", error);
            toast.error("Error al enviar la invitación");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <UserPlus size={20} />
                        </div>
                        Invitar Nuevo Usuario
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Envía una invitación por correo electrónico para dar acceso a la plataforma.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-slate-300">
                            <Mail size={16} />
                            Correo Electrónico
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {isAcademyTenant ? (
                        <div className="space-y-2">
                            <Label htmlFor="academyRole" className="text-slate-300">Rol en Academia</Label>
                            <select
                                id="academyRole"
                                value={academyRole}
                                onChange={(e) => setAcademyRole(e.target.value)}
                                disabled={isLoading}
                                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Selecciona un rol</option>
                                {ACADEMY_ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-slate-300">Rol del Usuario</Label>
                            <select
                                id="role"
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                disabled={isLoading || roles.length === 0}
                                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Selecciona un rol</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1 rounded-xl border-white/15 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
                        >
                            {isLoading ? "Enviando..." : "Enviar Invitación"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
