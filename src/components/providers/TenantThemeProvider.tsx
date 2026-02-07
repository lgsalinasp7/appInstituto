/**
 * TenantThemeProvider
 *
 * Server Component que inyecta el branding personalizado del tenant
 * mediante CSS variables y estilos customizados.
 *
 * Funcionalidades:
 * - CSS variables para colores, tipografía
 * - Custom CSS del tenant
 * - Cache con revalidación cada 5 minutos via unstable_cache
 */

import { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

interface TenantThemeProviderProps {
  tenantId: string;
  children: ReactNode;
}

interface TenantBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  loginBgImage: string | null;
  loginBgGradient: string | null;
  footerText: string | null;
  customCss: string | null;
  darkMode: boolean;
}

/**
 * Cache de branding con revalidación cada 5 minutos
 * Tag: tenant-branding-{tenantId} para invalidación selectiva
 */
const getBrandingCached = unstable_cache(
  async (tenantId: string): Promise<TenantBranding | null> => {
    try {
      const branding = await prisma.tenantBranding.findUnique({
        where: { tenantId },
        select: {
          logoUrl: true,
          faviconUrl: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          fontFamily: true,
          loginBgImage: true,
          loginBgGradient: true,
          footerText: true,
          customCss: true,
          darkMode: true,
        },
      });

      return branding;
    } catch (error) {
      console.error("Error al obtener branding del tenant:", error);
      return null;
    }
  },
  ["tenant-branding"],
  {
    revalidate: 300, // 5 minutos
    tags: ["tenant-branding"],
  }
);

// Valores por defecto si no hay branding configurado
const DEFAULT_BRANDING: TenantBranding = {
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#1e3a5f",
  secondaryColor: "#3b82f6",
  accentColor: "#10b981",
  fontFamily: "Inter",
  loginBgImage: null,
  loginBgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  footerText: null,
  customCss: null,
  darkMode: false,
};

export async function TenantThemeProvider({ tenantId, children }: TenantThemeProviderProps) {
  const branding = await getBrandingCached(tenantId);
  const theme = branding || DEFAULT_BRANDING;

  // Construir CSS como string para inyectar via dangerouslySetInnerHTML
  // (styled-jsx no funciona en Server Components)
  const cssVariables = `
    :root {
      --tenant-primary: ${theme.primaryColor};
      --tenant-secondary: ${theme.secondaryColor};
      --tenant-accent: ${theme.accentColor};
      --tenant-font-family: ${theme.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body {
      font-family: var(--tenant-font-family);
    }
    .bg-tenant-primary { background-color: var(--tenant-primary); }
    .bg-tenant-secondary { background-color: var(--tenant-secondary); }
    .bg-tenant-accent { background-color: var(--tenant-accent); }
    .text-tenant-primary { color: var(--tenant-primary); }
    .text-tenant-secondary { color: var(--tenant-secondary); }
    .text-tenant-accent { color: var(--tenant-accent); }
    .border-tenant-primary { border-color: var(--tenant-primary); }
    .border-tenant-secondary { border-color: var(--tenant-secondary); }
    .border-tenant-accent { border-color: var(--tenant-accent); }
    .btn-primary { background-color: var(--tenant-primary); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary { background-color: var(--tenant-secondary); color: white; }
    .btn-accent { background-color: var(--tenant-accent); color: white; }
    ${theme.customCss || ""}
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

      {/* Favicon personalizado */}
      {theme.faviconUrl && (
        <link rel="icon" href={theme.faviconUrl} />
      )}

      {children}
    </>
  );
}

/**
 * Hook para obtener el branding en Client Components
 * Nota: Requiere que el branding esté disponible en el contexto
 */
export function useTenantBranding() {
  // Para Client Components, el branding se pasa vía props desde Server Components
  // o se obtiene desde un endpoint API
  return {
    primaryColor: "var(--tenant-primary)",
    secondaryColor: "var(--tenant-secondary)",
    accentColor: "var(--tenant-accent)",
    fontFamily: "var(--tenant-font-family)",
  };
}

/**
 * Helper para obtener el branding del tenant (sin cache)
 * Útil para mutaciones donde se necesita el branding actualizado
 */
export async function getTenantBranding(tenantId: string): Promise<TenantBranding> {
  const branding = await prisma.tenantBranding.findUnique({
    where: { tenantId },
    select: {
      logoUrl: true,
      faviconUrl: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      fontFamily: true,
      loginBgImage: true,
      loginBgGradient: true,
      footerText: true,
      customCss: true,
      darkMode: true,
    },
  });

  return branding || DEFAULT_BRANDING;
}

/**
 * Helper para obtener el branding con cache y revalidación (5 min)
 * Usado en Server Components y layouts
 */
export async function getTenantBrandingCached(tenantId: string): Promise<TenantBranding> {
  return (await getBrandingCached(tenantId)) || DEFAULT_BRANDING;
}

export type { TenantBranding };
