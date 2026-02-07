"use client";

/**
 * BrandingContext
 *
 * Context de React para proporcionar datos de branding del tenant
 * a todos los Client Components del árbol.
 *
 * El Server Component padre (ProtectedLayoutWrapper / AuthLayoutWrapper)
 * obtiene el branding de la DB y lo pasa al provider.
 */

import { createContext, useContext, type ReactNode } from "react";

export interface BrandingData {
  tenantName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  footerText: string | null;
  darkMode: boolean;
}

const DEFAULT_BRANDING: BrandingData = {
  tenantName: "Plataforma Educativa",
  logoUrl: null,
  primaryColor: "#1e3a5f",
  secondaryColor: "#3b82f6",
  accentColor: "#10b981",
  fontFamily: "Inter",
  footerText: null,
  darkMode: false,
};

const BrandingContext = createContext<BrandingData>(DEFAULT_BRANDING);

interface BrandingProviderProps {
  branding: Partial<BrandingData>;
  children: ReactNode;
}

export function BrandingProvider({ branding, children }: BrandingProviderProps) {
  const value: BrandingData = {
    ...DEFAULT_BRANDING,
    ...branding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

/**
 * Hook para acceder al branding del tenant desde Client Components
 *
 * @example
 * const { tenantName, logoUrl, primaryColor } = useBranding();
 */
export function useBranding(): BrandingData {
  return useContext(BrandingContext);
}
