"use client";

import { MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { captureAttributionFromCurrentUrl, getAttribution } from "@/lib/attribution";
import { trackThankYouView, trackWhatsAppClick } from "@/lib/funnel-events";

interface MasterclassThankYouActionsProps {
  whatsappGroupUrl: string;
}

export function MasterclassThankYouActions({
  whatsappGroupUrl,
}: MasterclassThankYouActionsProps) {
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

  return (
    <a
      href={whatsappGroupUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        const attribution = getAttribution();
        trackWhatsAppClick({
          funnel: "masterclass_ia",
          page_path: "/masterclass-ia/gracias",
          destination: "whatsapp_group",
          utm_source: attribution.utmSource || undefined,
          utm_medium: attribution.utmMedium || undefined,
          utm_campaign: attribution.utmCampaign || undefined,
          fbclid: attribution.fbclid || undefined,
          gclid: attribution.gclid || undefined,
          ttclid: attribution.ttclid || undefined,
        });
      }}
      className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base md:text-lg transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.45)]"
    >
      Ir a WhatsApp
      <MessageCircle className="w-5 h-5" />
    </a>
  );
}
