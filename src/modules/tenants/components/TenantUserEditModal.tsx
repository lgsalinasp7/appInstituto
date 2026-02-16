"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Clipboard } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { TenantUser } from "../types";

interface TenantUserEditModalProps {
  user: TenantUser;
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TenantUserEditModal({
  user,
  tenantId,
  isOpen,
  onClose,
  onSuccess,
}: TenantUserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [setTempPassword, setSetTempPassword] = useState(false);
  const [showTempPasswordConfirm, setShowTempPasswordConfirm] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName(user.name || "");
      setEmail(user.email);
      setSetTempPassword(false);
      setShowTempPasswordConfirm(false);
      onClose();
    }
  };

  const performSubmit = useCallback(
    async (withTempPassword: boolean) => {
      setLoading(true);
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(
          `${origin}/api/admin/tenants/${tenantId}/users/${user.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: name.trim() || undefined,
              email: email.trim() || undefined,
              setTempPassword: withTempPassword || undefined,
            }),
          }
        );

        const data = await res.json();

        if (!data.success) {
          toast.error(data.error || "Error al actualizar usuario");
          return;
        }

        if (data.data?.tempPassword) {
          const tempPass = data.data.tempPassword;
          toast.success("Usuario actualizado. Contraseña temporal generada.", {
            description: (
              <div className="flex items-center gap-2 mt-2">
                <code className="px-2 py-1 rounded bg-slate-800 text-cyan-400 text-sm font-mono">
                  {tempPass}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-cyan-400 hover:text-cyan-300"
                  onClick={() => {
                    navigator.clipboard.writeText(tempPass);
                    toast.success("Contraseña copiada al portapapeles");
                  }}
                >
                  <Clipboard size={14} />
                </Button>
              </div>
            ),
            duration: 15000,
          });
        } else {
          toast.success("Usuario actualizado correctamente");
        }

        onSuccess();
        handleOpenChange(false);
      } catch (error) {
        console.error(error);
        toast.error("Error al actualizar usuario");
      } finally {
        setLoading(false);
        setShowTempPasswordConfirm(false);
      }
    },
    [tenantId, user.id, name, email]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (setTempPassword && !showTempPasswordConfirm) {
      setShowTempPasswordConfirm(true);
      return;
    }

    await performSubmit(setTempPassword);
  };

  const handleConfirmTempPassword = () => {
    setShowTempPasswordConfirm(false);
    performSubmit(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <form
            id="edit-user-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-sm">
                {user.role?.name || "Sin rol"}
              </div>
            </div>
            <div className="space-y-3 pt-2 border-t border-white/5">
              <Label className="text-slate-400">Contraseña temporal</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setTempPassword}
                    onChange={(e) => setSetTempPassword(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-300">
                    Generar y asignar contraseña temporal
                  </span>
                </label>
              </div>
              <p className="text-xs text-slate-500">
                El usuario deberá cambiar la contraseña en el primer inicio de sesión.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="bg-slate-800 border-slate-700 text-slate-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={showTempPasswordConfirm}
        onClose={() => setShowTempPasswordConfirm(false)}
        onConfirm={handleConfirmTempPassword}
        title="Generar contraseña temporal"
        description="¿Estás seguro? Se generará una nueva contraseña y el usuario deberá cambiarla en el primer inicio de sesión. La contraseña se mostrará una sola vez al guardar."
        variant="default"
        confirmText="Generar"
      />
    </>
  );
}
