"use client";

import { FlagValues } from "flags/react";

/**
 * Expone los feature flags del funnel a la DOM para que Vercel Web Analytics
 * pueda enriquecer page views y eventos con estos flags.
 * @see https://vercel.com/docs/flags/observability/web-analytics
 */
const FUNNEL_FLAGS = {
  masterclassCampaign: "masterclass-ia",
} as const;

export function FunnelFlagValues() {
  return <FlagValues values={FUNNEL_FLAGS} />;
}
