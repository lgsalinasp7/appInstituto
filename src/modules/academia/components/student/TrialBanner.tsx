"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL = "https://wa.me/573337226157";

interface TrialBannerProps {
  trialExpiresAt: Date;
  nextCohortDate?: Date | null;
  isExpired?: boolean;
  onContactClick?: () => void;
}

export function TrialBanner({
  trialExpiresAt,
  nextCohortDate,
  isExpired = false,
  onContactClick,
}: TrialBannerProps) {
  const handleContact = async () => {
    onContactClick?.();
    try {
      await fetch("/api/academy/trial/contact", { method: "POST" });
    } catch {
      // No bloquear si falla el log
    }
    const text = encodeURIComponent(
      "Hola, quiero consultar sobre el acceso completo a Kaled Academy"
    );
    window.open(`${WHATSAPP_URL}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const formattedExpiry = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(trialExpiresAt));

  const formattedNextCohort = nextCohortDate
    ? new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(new Date(nextCohortDate))
    : null;

  if (isExpired) {
    return (
      <div className="sticky top-0 z-40 w-full bg-amber-950/90 border-b border-amber-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-amber-200 text-sm font-medium text-center sm:text-left">
            Tu acceso de prueba ha expirado. Contáctanos para comprar el acceso completo.
          </p>
          <Button
            size="sm"
            onClick={handleContact}
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white shrink-0"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contáctanos para comprar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 w-full bg-cyan-950/90 border-b border-cyan-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-cyan-200 text-sm font-medium text-center sm:text-left">
          Tienes acceso de prueba por 2 días (expira: {formattedExpiry}).
          {formattedNextCohort && (
            <> El próximo cohorte inicia el {formattedNextCohort}.</>
          )}{" "}
          Contáctanos para comprar el acceso completo.
        </p>
        <Button
          size="sm"
          onClick={handleContact}
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white shrink-0"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contáctanos para comprar
        </Button>
      </div>
    </div>
  );
}
