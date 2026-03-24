"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Mail, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";

interface CohortOption {
  id: string;
  name: string;
  courseTitle: string;
  kind: string;
}

interface InviteTrialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSuccess?: () => void;
  /** Si true, usa POST /api/admin/tenants/{adminTenantKey}/invitations */
  useAdminApi?: boolean;
  /** Id o slug del tenant para APIs admin (cohortes e invitación) */
  adminTenantKey?: string;
}

export function InviteTrialModal({
  open,
  onOpenChange,
  onInviteSuccess,
  useAdminApi = false,
  adminTenantKey = "kaledacademy",
}: InviteTrialModalProps) {
  const [email, setEmail] = useState("");
  const [academyCohortId, setAcademyCohortId] = useState("");
  const [trialNextCohortDate, setTrialNextCohortDate] = useState("");
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const loadCohorts = useCallback(async () => {
    setCohortsLoading(true);
    try {
      const url = useAdminApi
        ? `/api/admin/tenants/${encodeURIComponent(adminTenantKey)}/cohorts-for-invitation`
        : "/api/academy/cohorts/for-invitation";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCohorts(data.data);
      } else {
        setCohorts([]);
        toast.error(data.error || "No se pudieron cargar los cohortes");
      }
    } catch {
      setCohorts([]);
      toast.error("Error al cargar cohortes");
    } finally {
      setCohortsLoading(false);
    }
  }, [useAdminApi, adminTenantKey]);

  useEffect(() => {
    if (open) {
      void loadCohorts();
    } else {
      setEmail("");
      setAcademyCohortId("");
      setTrialNextCohortDate("");
    }
  }, [open, loadCohorts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresa el correo electrónico");
      return;
    }
    if (!academyCohortId) {
      toast.error("Selecciona el cohorte de prueba (debe existir y estar activo)");
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
        ? {
            email,
            isTrialInvitation: true,
            academyCohortId,
            trialNextCohortDate: date.toISOString(),
          }
        : {
            email,
            inviterId: user?.id,
            isTrialInvitation: true,
            academyCohortId,
            trialNextCohortDate: date.toISOString(),
          };

      const url = useAdminApi
        ? `/api/admin/tenants/${encodeURIComponent(adminTenantKey)}/invitations`
        : "/api/invitations";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || "Error al enviar invitación de prueba");
        return;
      }

      toast.success(`Invitación de prueba enviada a ${email}`);
      setEmail("");
      setAcademyCohortId("");
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
            Elige un cohorte ya creado (por ejemplo masterclass). Al aceptar, el usuario queda matriculado ahí con acceso de prueba a la primera lección del Módulo 1.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="trial-email" className="flex items-center gap-2 text-slate-300">
              <Mail size={16} />
              Correo electrónico
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
            <Label htmlFor="trial-cohort-select" className="text-slate-300">
              Cohorte de prueba
            </Label>
            {cohortsLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando cohortes…
              </div>
            ) : (
              <select
                id="trial-cohort-select"
                value={academyCohortId}
                onChange={(e) => setAcademyCohortId(e.target.value)}
                required
                disabled={isLoading || cohorts.length === 0}
                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:opacity-50"
              >
                <option value="">— Selecciona cohorte —</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.courseTitle}
                  </option>
                ))}
              </select>
            )}
            {cohorts.length === 0 && !cohortsLoading && (
              <p className="text-xs text-amber-200/80">
                No hay cohortes activos. Crea uno en la gestión del curso antes de invitar.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trial-date" className="text-slate-300">
              Fecha del próximo cohorte (mensaje en el correo)
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
              disabled={isLoading || cohortsLoading || !academyCohortId}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500"
            >
              {isLoading ? "Enviando…" : "Enviar invitación a prueba"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
