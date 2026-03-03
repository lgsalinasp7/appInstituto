"use client";

import { useEffect } from "react";
import { trackLandingView } from "@/lib/funnel-events";

/**
 * Envía a Vercel Analytics (y GA/Meta) el evento "Masterclass Landing View"
 * cuando el usuario entra a /masterclass-ia.
 * Ver: https://vercel.com/docs/analytics/custom-events
 */
export function MasterclassLandingTracker() {
  useEffect(() => {
    trackLandingView({
      campaign: "masterclass-ia",
      funnel: "masterclass_ia",
      page_path: "/masterclass-ia",
    });
  }, []);
  return null;
}
