import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://192.168.1.8:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "recharts",
      "date-fns",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'kaledsoft.tech',
      },
      {
        protocol: 'https',
        hostname: 'p7h74q4azjsxudyn.public.blob.vercel-storage.com',
      },
    ],
  },
};

// Sentry: solo activar wrapper si hay DSN configurado. Mantiene Turbopack
// funcionando en desarrollo sin requerir setup de Sentry.
const sentryEnabled = Boolean(process.env.SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Silenciar logs en local; mostrar solo en CI.
      silent: !process.env.CI,
      // Source maps upload se configurara en una iteracion posterior.
      sourcemaps: {
        disable: true,
      },
      // No inyectar el tunnel route en el cliente por defecto.
      tunnelRoute: undefined,
      disableLogger: true,
    })
  : nextConfig;
