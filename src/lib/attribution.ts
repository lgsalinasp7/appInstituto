"use client";

export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  landingPath?: string;
  capturedAt?: string;
}

interface AttributionStore {
  firstTouch?: AttributionData;
  lastTouch?: AttributionData;
}

const ATTRIBUTION_STORAGE_KEY = "kaledsoft_attribution_v1";
const ATTRIBUTION_COOKIE_KEY = "kaledsoft_attr";

function readStoredAttribution(): AttributionStore {
  if (typeof window === "undefined") return {};

  try {
    const value = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!value) return {};
    return JSON.parse(value) as AttributionStore;
  } catch {
    return {};
  }
}

function writeStoredAttribution(data: AttributionStore) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors (private mode, quotas, etc).
  }
}

function readAttributionFromUrl(params: URLSearchParams): AttributionData {
  const now = new Date().toISOString();
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    fbclid: params.get("fbclid") || undefined,
    gclid: params.get("gclid") || undefined,
    ttclid: params.get("ttclid") || undefined,
    landingPath: typeof window !== "undefined" ? window.location.pathname : undefined,
    capturedAt: now,
  };
}

function hasAttributionSignals(data: AttributionData): boolean {
  return Boolean(
    data.utmSource ||
      data.utmMedium ||
      data.utmCampaign ||
      data.utmContent ||
      data.fbclid ||
      data.gclid ||
      data.ttclid
  );
}

export function captureAttributionFromCurrentUrl() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const current = readAttributionFromUrl(params);
  if (!hasAttributionSignals(current)) return;

  const existing = readStoredAttribution();
  const firstTouch = existing.firstTouch ?? current;
  const lastTouch = current;

  writeStoredAttribution({ firstTouch, lastTouch });

  // Lightweight cookie copy to make attribution available outside localStorage consumers.
  const cookiePayload = encodeURIComponent(
    JSON.stringify({ firstTouch, lastTouch })
  );
  document.cookie = `${ATTRIBUTION_COOKIE_KEY}=${cookiePayload}; path=/; max-age=2592000; samesite=lax`;
}

export function getAttribution(): AttributionData {
  const stored = readStoredAttribution();
  return {
    ...(stored.firstTouch ?? {}),
    ...(stored.lastTouch ?? {}),
  };
}

export function appendAttributionToFormData(formData: FormData) {
  const attr = getAttribution();
  if (!attr) return;

  // Preserve explicit URL/form values and only backfill missing attribution fields.
  const setIfMissing = (key: string, value?: string) => {
    if (!value) return;
    const current = formData.get(key);
    if (typeof current === "string" && current.trim().length > 0) return;
    formData.set(key, value);
  };

  setIfMissing("utmSource", attr.utmSource);
  setIfMissing("utmMedium", attr.utmMedium);
  setIfMissing("utmCampaign", attr.utmCampaign);
  setIfMissing("utmContent", attr.utmContent);
  setIfMissing("fbclid", attr.fbclid);
  setIfMissing("gclid", attr.gclid);
  setIfMissing("ttclid", attr.ttclid);
}

export function buildAttributionSummary(attr: AttributionData): string {
  const parts = [
    attr.utmSource ? `utm_source=${attr.utmSource}` : null,
    attr.utmMedium ? `utm_medium=${attr.utmMedium}` : null,
    attr.utmCampaign ? `utm_campaign=${attr.utmCampaign}` : null,
    attr.utmContent ? `utm_content=${attr.utmContent}` : null,
    attr.fbclid ? `fbclid=${attr.fbclid}` : null,
    attr.gclid ? `gclid=${attr.gclid}` : null,
    attr.ttclid ? `ttclid=${attr.ttclid}` : null,
  ].filter(Boolean);

  return parts.join(" | ");
}
