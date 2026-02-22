'use client';

import Script from 'next/script';
import { useEffect } from 'react';

interface MetaPixelProps {
  pixelId?: string;
}

// Declarar fbq en el objeto window
declare global {
  interface Window {
    fbq: (
      track: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  // Si no hay pixel ID configurado, no renderizar nada
  if (!pixelId) return null;

  useEffect(() => {
    // Track PageView cuando el componente se monta
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <>
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
            fbq('init', '${pixelId}');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Funciones helper para trackear eventos
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

export const trackLead = () => {
  trackEvent('Lead');
};

export const trackCompleteRegistration = () => {
  trackEvent('CompleteRegistration');
};

export const trackViewContent = (contentName: string) => {
  trackEvent('ViewContent', { content_name: contentName });
};
