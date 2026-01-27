"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface InviteUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInviteSuccess?: () => void;
    isSuperAdmin?: boolean;
}

const AVAILABLE_ROLES_SUPERADMIN = [
    { value: "VENTAS", label: "Ventas" },
    { value: "CARTERA", label: "Cartera" },
    { value: "ADMINISTRADOR", label: "Administrador" },
];

const AVAILABLE_ROLES_ADMIN = [
    { value: "VENTAS", label: "Ventas" },
    { value: "CARTERA", label: "Cartera" },
];

export function InviteUserModal({ open, onOpenChange, onInviteSuccess, isSuperAdmin = false }: InviteUserModalProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const availableRoles = isSuperAdmin ? AVAILABLE_ROLES_SUPERADMIN : AVAILABLE_ROLES_ADMIN;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !role) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Por favor ingresa un email válido");
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            // const response = await fetch("/api/invitations", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ email, role }),
            // });
            // const data = await response.json();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success(`Invitación enviada a ${email}`);
            setEmail("");
            setRole("");
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
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isLoading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="">Selecciona un rol</option>
                            {availableRoles.map((r) => (
                                <option key={r.value} value={r.value}>
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
