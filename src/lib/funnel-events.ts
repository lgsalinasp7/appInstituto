"use client";

import { trackEvent } from "@/components/analytics/GoogleAnalytics";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";

type EventPayload = Record<string, unknown>;

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
}

export function trackThankYouView(payload?: EventPayload) {
  sendUnifiedEvent("thank_you_view", payload, "CompleteRegistration");
}

export function trackWhatsAppClick(payload?: EventPayload) {
  sendUnifiedEvent("whatsapp_click", payload, "Contact");
}

export function trackCallBooked(payload?: EventPayload) {
  sendUnifiedEvent("call_booked", payload, "Schedule");
}

export function trackLeadQualified(payload?: EventPayload) {
  sendUnifiedEvent("lead_qualified", payload, "SubmitApplication");
}
