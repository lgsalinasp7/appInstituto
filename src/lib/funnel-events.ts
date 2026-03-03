"use client";

import { trackEvent } from "@/components/analytics/GoogleAnalytics";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { track } from "@vercel/analytics";

type EventPayload = Record<string, unknown>;

const CAMPAIGN_MASTERCLASS = "masterclass-ia";

function sendUnifiedEvent(
  eventName: string,
  payload?: EventPayload,
  metaEventName?: string
) {
  trackEvent(eventName, payload);
  if (metaEventName) {
    trackMetaEvent(metaEventName, payload);
  }
}

export function trackLeadSubmit(payload?: EventPayload) {
  sendUnifiedEvent("lead_submit", payload, "Lead");
  if (payload?.funnel === "masterclass_ia") {
    track("Masterclass Lead", {
      campaign: CAMPAIGN_MASTERCLASS,
      page: (payload?.page_path as string) || "/masterclass-ia",
    });
  }
}

export function trackThankYouView(payload?: EventPayload) {
  sendUnifiedEvent("thank_you_view", payload, "CompleteRegistration");
  const campaign = (payload?.campaign as string) || CAMPAIGN_MASTERCLASS;
  if (campaign === CAMPAIGN_MASTERCLASS || payload?.funnel === "masterclass_ia") {
    track("Masterclass Thank You View", {
      campaign: CAMPAIGN_MASTERCLASS,
      page: "gracias",
    });
  }
}

export function trackLandingView(payload?: EventPayload) {
  sendUnifiedEvent("landing_view", payload);
  const campaign = (payload?.campaign as string) || CAMPAIGN_MASTERCLASS;
  if (campaign === CAMPAIGN_MASTERCLASS || payload?.funnel === "masterclass_ia") {
    track("Masterclass Landing View", {
      campaign: CAMPAIGN_MASTERCLASS,
      page: "masterclass-ia",
    });
  }
}

export function trackWhatsAppClick(payload?: EventPayload) {
  sendUnifiedEvent("whatsapp_click", payload, "Contact");
  if (payload?.funnel === "masterclass_ia") {
    track("Masterclass WhatsApp Click", {
      campaign: CAMPAIGN_MASTERCLASS,
      page: (payload?.page_path as string) || "/masterclass-ia/gracias",
      destination: (payload?.destination as string) || "whatsapp_group",
    });
  }
}

export function trackCallBooked(payload?: EventPayload) {
  sendUnifiedEvent("call_booked", payload, "Schedule");
}

export function trackLeadQualified(payload?: EventPayload) {
  sendUnifiedEvent("lead_qualified", payload, "SubmitApplication");
}
