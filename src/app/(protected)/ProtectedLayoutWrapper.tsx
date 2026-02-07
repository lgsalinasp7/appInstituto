/**
 * ProtectedLayoutWrapper - Server Component
 * 
 * Responsabilidades:
 * 1. Resolver tenant desde x-tenant-slug
 * 2. Redirigir a /suspended si el tenant está SUSPENDIDO/CANCELADO
 * 3. Inyectar TenantThemeProvider + BrandingProvider
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TenantThemeProvider, getTenantBrandingCached } from "@/components/providers/TenantThemeProvider";
import { BrandingProvider } from "@/components/providers/BrandingContext";
import { prisma } from "@/lib/prisma";
import ProtectedLayoutClient from "./ProtectedLayoutClient";

async function getTenantData() {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, name: true, slug: true, status: true },
  });

  return tenant;
}

export default async function ProtectedLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantData();

  // Si no hay tenant, renderizar sin tema (usuario de plataforma)
  if (!tenant) {
    return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
  }

  // Redirigir a /suspended si el tenant está SUSPENDIDO o CANCELADO
  if (tenant.status === "SUSPENDIDO" || tenant.status === "CANCELADO") {
    redirect("/suspended");
  }

  // Obtener branding cacheado
  const branding = await getTenantBrandingCached(tenant.id);

  // Inyectar TenantThemeProvider (CSS vars) + BrandingProvider (React Context)
  return (
    <TenantThemeProvider tenantId={tenant.id}>
      <BrandingProvider
        branding={{
          tenantName: tenant.name,
          logoUrl: branding.logoUrl,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          accentColor: branding.accentColor,
          fontFamily: branding.fontFamily,
          footerText: branding.footerText,
          darkMode: branding.darkMode,
        }}
      >
        <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
      </BrandingProvider>
    </TenantThemeProvider>
  );
}
