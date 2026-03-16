"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";

interface InviteTrialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSuccess?: () => void;
  /** Si true, usa POST /api/admin/tenants/kaledacademy/invitations (para super admin) */
  useAdminApi?: boolean;
}

export function InviteTrialModal({
  open,
  onOpenChange,
  onInviteSuccess,
  useAdminApi = false,
}: InviteTrialModalProps) {
  const [email, setEmail] = useState("");
  const [trialCohortName, setTrialCohortName] = useState("");
  const [trialNextCohortDate, setTrialNextCohortDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresa el correo electrónico");
      return;
    }
    if (!trialCohortName) {
      toast.error("Por favor ingresa el nombre del cohorte de prueba");
      return;
    }
    if (!trialNextCohortDate) {
      toast.error("Por favor selecciona la fecha del próximo cohorte");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    const date = new Date(trialNextCohortDate);
    if (isNaN(date.getTime())) {
      toast.error("Fecha inválida");
      return;
    }

    setIsLoading(true);

    try {
      const body = useAdminApi
        ? { email, isTrialInvitation: true, trialCohortName, trialNextCohortDate: date.toISOString() }
        : {
            email,
            inviterId: user?.id,
            isTrialInvitation: true,
            trialCohortName,
            trialNextCohortDate: date.toISOString(),
          };

      const url = useAdminApi
        ? "/api/admin/tenants/kaledacademy/invitations"
        : "/api/invitations";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || "Error al enviar invitación de prueba");
        return;
      }

      toast.success(`Invitación de prueba enviada a ${email}`);
      setEmail("");
      setTrialCohortName("");
      setTrialNextCohortDate("");
      onOpenChange(false);
      onInviteSuccess?.();
    } catch (error) {
      console.error("Error sending trial invitation:", error);
      toast.error("Error al enviar la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-slate-900 border-slate-700/50 text-white">
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-orange-600" />
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={20} />
            </div>
            Invitar a versión prueba
          </DialogTitle>
          <DialogDescription className="pt-2">
            Envía una invitación por correo con acceso de 2 días a la primera lección del Módulo 1.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="trial-email" className="flex items-center gap-2 text-slate-300">
              <Mail size={16} />
              Correo Electrónico
            </Label>
            <Input
              id="trial-email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-950/70 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trial-cohort" className="text-slate-300">
              Nombre del cohorte de prueba
            </Label>
            <Input
              id="trial-cohort"
              type="text"
              placeholder="Ej: Masterclass Marzo 2025"
              value={trialCohortName}
              onChange={(e) => setTrialCohortName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-950/70 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trial-date" className="text-slate-300">
              Fecha del próximo cohorte
            </Label>
            <Input
              id="trial-date"
              type="date"
              value={trialNextCohortDate}
              onChange={(e) => setTrialNextCohortDate(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-950/70 border-slate-700"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline-dark"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500"
            >
              {isLoading ? "Enviando..." : "Enviar invitación a prueba"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
