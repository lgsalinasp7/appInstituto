"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TenantWithDetails } from "../types";

interface TenantEditModalProps {
    tenant: TenantWithDetails;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TenantEditModal({ tenant, isOpen, onClose, onSuccess }: TenantEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        subscriptionEndsAt: tenant.subscriptionEndsAt ? new Date(tenant.subscriptionEndsAt) : undefined,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Error actualizando tenant");

            toast.success("Tenant actualizado correctamente");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar tenant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Editar Tenant</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plan">Plan</Label>
                        <select
                            id="plan"
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            value={formData.plan}
                            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        >
                            <option value="BASICO">Básico</option>
                            <option value="ESTANDAR">Estándar</option>
                            <option value="PREMIUM">Premium</option>
                        </select>
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <Label>Vencimiento Suscripción</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white",
                                        !formData.subscriptionEndsAt && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.subscriptionEndsAt ? (
                                        format(formData.subscriptionEndsAt, "PPP")
                                    ) : (
                                        <span>Seleccionar fecha</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800">
                                <Calendar
                                    mode="single"
                                    selected={formData.subscriptionEndsAt}
                                    onSelect={(date) => setFormData({ ...formData, subscriptionEndsAt: date })}
                                    initialFocus
                                    className="bg-slate-900 text-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="hover:text-white hover:bg-white/10 text-slate-400">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
