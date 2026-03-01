/**
 * Configuracion base para el tenant Kaled Academy.
 * Centraliza la identidad inicial para facilitar mantenimiento.
 */
export const KALED_ACADEMY_CONFIG = {
  tenant: {
    name: "Kaled Academy",
    slug: "kaledacademy",
    domain: "kaledacademy.kaledsoft.tech",
    plan: "PROFESIONAL",
    status: "ACTIVO",
  },
  admin: {
    name: "Gerente Kaled Academy",
    email: "gerente@kaledsoft.tech",
  },
  branding: {
    logoUrl: "/kaledsoft-logo-transparent.png",
    primaryColor: "#1e3a5f",
    secondaryColor: "#3b82f6",
    accentColor: "#10b981",
    darkMode: true,
    footerText: "Kaled Academy - Ecosistema KaledSoft",
  },
} as const;

export type KaledAcademyConfig = typeof KALED_ACADEMY_CONFIG;
