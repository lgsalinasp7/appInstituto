/**
 * Utilidad compartida para obtener el logo de un tenant.
 * Orden de prioridad:
 * 1. branding.logoUrl (desde ProductTemplate al desplegar, o desde admin/branding)
 * 2. Mapa por slug (fallback para tenants sin branding o compatibilidad)
 * 3. null → el componente mostrará emoji por defecto
 */

export interface TenantLogoConfig {
  src: string;
  alt: string;
  whiteBg?: boolean;
  blendMultiply?: boolean;
}

export interface TenantWithLogoInput {
  slug?: string | null;
  name?: string | null;
  branding?: { logoUrl?: string | null } | null;
}

/** Fallback por slug cuando no hay branding.logoUrl. */
const SLUG_LOGO_MAP: Record<string, { src: string; alt: string; whiteBg?: boolean; blendMultiply?: boolean }> = {
  kaledacademy: { src: "/logo%20kalebAcademy.png", alt: "Kaleb Academy" },
  kaledsoft: { src: "/kaledsoft-logo-transparent.png", alt: "KaledSoft" },
  edutec: { src: "/logo-edutec2.png", alt: "Edutec", whiteBg: true },
  poimensoft: { src: "/logo-Poimensoft.png", alt: "Poimensoft", whiteBg: true },
};

/**
 * Obtiene la configuración del logo para un tenant.
 * Prioridad: branding.logoUrl > mapa por slug > null
 */
export function getTenantLogo(tenant: TenantWithLogoInput): TenantLogoConfig | null {
  const logoUrl = tenant.branding?.logoUrl;
  if (logoUrl && typeof logoUrl === "string" && logoUrl.trim() !== "") {
    return {
      src: logoUrl.startsWith("/") ? logoUrl : `/${logoUrl.replace(/^\//, "")}`,
      alt: tenant.name || tenant.slug || "Logo",
      whiteBg: true,
    };
  }

  const slug = tenant.slug?.toLowerCase() ?? "";
  const fallback = SLUG_LOGO_MAP[slug];
  if (fallback) {
    return fallback;
  }

  return null;
}
