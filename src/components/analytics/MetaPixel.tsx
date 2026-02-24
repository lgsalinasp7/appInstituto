"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Declaración de tipos para fbq
declare global {
  interface Window {
    fbq: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function MetaPixel() {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    if (!META_PIXEL_ID || typeof window.fbq === "undefined") return;

    window.fbq("track", "PageView");
  }, [pathname]);

  // Don't load in development or if no pixel ID
  if (!META_PIXEL_ID || process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}

// Helper function to track custom events
export const trackMetaEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", eventName, eventParams);
  }
};
