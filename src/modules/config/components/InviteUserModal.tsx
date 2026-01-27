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

export function InviteUserModal({ open, onOpenChange, onInviteSuccess, isSuperAdmin = false }: InviteUserModalProps) {
    const [email, setEmail] = useState("");
    const [roleId, setRoleId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const { user } = useAuthStore();

    // Fetch available roles on mount
    useEffect(() => {
        async function fetchRoles() {
            try {
                const response = await fetch("/api/roles");
                const data = await response.json();
                if (data.success) {
                    // Filter roles based on user's role
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
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        }

        if (open) {
            fetchRoles();
        }
    }, [open, isSuperAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !roleId) {
            toast.error("Por favor completa todos los campos");
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

        setIsLoading(true);

        try {
            const response = await fetch("/api/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    roleId,
                    inviterId: user.id,
                }),
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus size={20} className="text-primary" />
                        Invitar Nuevo Usuario
                    </DialogTitle>
                    <DialogDescription>
                        Envía una invitación por correo electrónico para dar acceso a la plataforma
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
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

                    <div className="space-y-2">
                        <Label htmlFor="role">Rol del Usuario</Label>
                        <select
                            id="role"
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            disabled={isLoading || roles.length === 0}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? "Enviando..." : "Enviar Invitación"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
