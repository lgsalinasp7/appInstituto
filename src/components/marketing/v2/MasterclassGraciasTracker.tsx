"use client";

import { useEffect } from "react";
import { trackThankYouView } from "@/lib/funnel-events";

/**
 * Envía a Vercel Analytics (y GA/Meta) el evento "Masterclass Thank You View"
 * cuando el usuario llega a /masterclass-ia/gracias.
 * Ver: https://vercel.com/docs/analytics/custom-events
 */
export function MasterclassGraciasTracker() {
  useEffect(() => {
    trackThankYouView({
      campaign: "masterclass-ia",
      funnel: "masterclass_ia",
      page_path: "/masterclass-ia/gracias",
    });
  }, []);
  return null;
}
