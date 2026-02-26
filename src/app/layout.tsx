import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LazyAnalytics } from "@/components/providers/LazyAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { CookieConsent } from "@/components/CookieConsent";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL('https://kaledsoft.tech'),
  title: {
    default: "KaledSoft | Academia de IA y Lab de Software en Colombia",
    template: "%s | KaledSoft"
  },
  description: "Expertos en Desarrollo de Software e Inteligencia Artificial en Montería, la Costa Caribe y Colombia. Formación de élite y soluciones tecnológicas B2B.",
  keywords: ["Desarrollo de software Montería", "Inteligencia Artificial Colombia", "Software factory Costa Caribe", "Academia de programación Colombia", "Agentes de IA", "KaledSoft"],
  authors: [{ name: "KaledSoft Team" }],
  creator: "KaledSoft Technologies",
  publisher: "KaledSoft Technologies",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://kaledsoft.tech",
    siteName: "KaledSoft",
    title: "KaledSoft | Academia de IA y Laboratorio de Software",
    description: "Liderando la revolución de la IA en la Costa Caribe. Formación avanzada y desarrollo de software de alto impacto.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KaledSoft Technologies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KaledSoft | IA & Software en Colombia",
    description: "Academia de Inteligencia Artificial y Laboratorio de Ingeniería.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <LocalBusinessSchema />
        {/* Preload critical resources */}
        <link
          rel="preload"
          as="image"
          href="/kaledsoft-logo-transparent.webp"
          type="image/webp"
        />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0891b2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KaledSoft" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
        <LazyAnalytics />
        <GoogleAnalytics />
        <MetaPixel />
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  );
}
