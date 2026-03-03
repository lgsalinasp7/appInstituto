"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { captureAttributionFromCurrentUrl, getAttribution } from "@/lib/attribution";
import { trackThankYouView, trackWhatsAppClick } from "@/lib/funnel-events";

interface MasterclassThankYouActionsProps {
  whatsappGroupUrl: string;
}

export function MasterclassThankYouActions({
  whatsappGroupUrl,
}: MasterclassThankYouActionsProps) {
  const [countdown, setCountdown] = useState(5);

  const handleWhatsAppRedirect = useCallback((method: "auto" | "manual") => {
    const attribution = getAttribution();
    trackWhatsAppClick({
      funnel: "masterclass_ia",
      page_path: "/masterclass-ia/gracias",
      destination: "whatsapp_group",
      redirect_method: method,
      utm_source: attribution.utmSource || undefined,
      utm_medium: attribution.utmMedium || undefined,
      utm_campaign: attribution.utmCampaign || undefined,
      fbclid: attribution.fbclid || undefined,
      gclid: attribution.gclid || undefined,
      ttclid: attribution.ttclid || undefined,
    });
    window.location.href = whatsappGroupUrl;
  }, [whatsappGroupUrl]);

  useEffect(() => {
    captureAttributionFromCurrentUrl();
    const attribution = getAttribution();

    trackThankYouView({
      funnel: "masterclass_ia",
      page_path: "/masterclass-ia/gracias",
      utm_source: attribution.utmSource || undefined,
      utm_medium: attribution.utmMedium || undefined,
      utm_campaign: attribution.utmCampaign || undefined,
      fbclid: attribution.fbclid || undefined,
      gclid: attribution.gclid || undefined,
      ttclid: attribution.ttclid || undefined,
    });
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      handleWhatsAppRedirect("auto");
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, handleWhatsAppRedirect]);

  return (
    <div className="space-y-6">
      {/* Progress indicators */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold">
        <span className="flex items-center gap-1.5 text-green-400">Cupo reservado ✓</span>
        <span className="text-slate-600">|</span>
        <span className="flex items-center gap-1.5 text-green-400">Email enviado ✓</span>
        <span className="text-slate-600">|</span>
        <span className="flex items-center gap-1.5 text-cyan-400">WhatsApp →</span>
      </div>

      {/* Countdown */}
      <div className="space-y-2">
        <p className="text-slate-300 text-base font-medium">
          Redirigiendo a WhatsApp en...
        </p>
        <p className="text-6xl font-black text-cyan-400 tabular-nums">
          {countdown}
        </p>
      </div>

      {/* Manual fallback button */}
      <button
        onClick={() => handleWhatsAppRedirect("manual")}
        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base md:text-lg transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.45)]"
      >
        O haz clic aquí ahora
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
